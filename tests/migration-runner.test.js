import { afterEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { applyMigrations, connectionOptions, loadMigrations, planMigrations, runMigrations } from "../server/migrations/runner.js";
import { migrationBody } from "../server/migrations/sql.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const logger = { info: vi.fn() };
let database;
async function fixture({ base = true } = {}) {
  database = new PGlite();
  await database.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS");
  if (base) {
    const schema = await read("../supabase/schema.sql");
    await database.exec(schema.match(/create table if not exists public\.platform_users[\s\S]*?\n\);/i)[0]);
  }
  return {
    query: async (sql, params) => params ? database.query(sql, params) : (await database.exec(sql)).at(-1),
  };
}
afterEach(async () => { await database?.close(); database = undefined; logger.info.mockClear(); });

describe("Automatic migrations against an isolated Postgres engine", () => {
  it("upgrades a database with manually applied repairs, preserves records and skips the next deployment", async () => {
    const client = await fixture();
    // Same starting state as production: repair SQL has already run manually,
    // but the automatic migration history does not exist yet.
    await database.exec(await read("../supabase/migrations/20261101084337_repair_agent_runtime.sql"));
    await database.exec(await read("../supabase/migrations/20261101090525_repair_profile_photo_columns.sql"));
    const user = (await database.query("INSERT INTO platform_users(full_name,email,password_hash) VALUES ('Keep me','keep@example.test','same-hash') RETURNING id")).rows[0];
    await database.query("INSERT INTO advisor_profiles(user_id,bio,photo_url) VALUES ($1,'Keep bio','https://example.test/photo.jpg')", [user.id]);
    const migrations = await loadMigrations();
    expect(migrations).toHaveLength(3);
    expect(await applyMigrations(client, migrations, logger)).toEqual({ applied: 3, existing: 0 });
    const firstHistory = (await database.query("SELECT * FROM moneyminds_internal.schema_migrations ORDER BY version")).rows;
    expect(await applyMigrations(client, migrations, logger)).toEqual({ applied: 0, existing: 3 });
    expect((await database.query("SELECT * FROM moneyminds_internal.schema_migrations ORDER BY version")).rows).toEqual(firstHistory);
    expect((await database.query("SELECT password_hash FROM platform_users")).rows).toEqual([{ password_hash: "same-hash" }]);
    expect((await database.query("SELECT bio,photo_url FROM advisor_profiles")).rows).toEqual([{ bio: "Keep bio", photo_url: "https://example.test/photo.jpg" }]);
    expect((await database.query(await read("../supabase/admin_console_audit.sql"))).rows.every((r) => r.status === "READY")).toBe(true);
    expect((await database.query("SELECT to_regclass('public.users') AS obsolete")).rows[0].obsolete).toBeNull();
    const access = (await database.query("SELECT has_schema_privilege('anon','moneyminds_internal','USAGE') AS anon,has_table_privilege('authenticated','moneyminds_internal.schema_migrations','SELECT') AS authenticated,has_table_privilege('service_role','moneyminds_internal.schema_migrations','INSERT') AS api_write")).rows[0];
    expect(access).toEqual({ anon: false, authenticated: false, api_write: false });
  }, 60_000);

  it("rolls back DDL, data and history on failure, stops later files, and can retry", async () => {
    const client = await fixture();
    const first = { filename: "20261101000000_first.sql", version: "20261101000000", checksum: "first", sql: "CREATE TABLE public.kept(id int)" };
    const second = { filename: "20261101000001_second.sql", version: "20261101000001", checksum: "second", sql: "CREATE TABLE public.must_rollback(id int); INSERT INTO public.kept VALUES (1); SELECT 1/0" };
    const third = { filename: "20261101000002_third.sql", version: "20261101000002", checksum: "third", sql: "CREATE TABLE public.never_reached(id int)" };
    await expect(applyMigrations(client, [first, second, third], logger)).rejects.toThrow(/second.sql failed \(22012\)/);
    expect((await database.query("SELECT version FROM moneyminds_internal.schema_migrations")).rows).toEqual([{ version: first.version }]);
    expect((await database.query("SELECT to_regclass('public.must_rollback') AS rolled_back,to_regclass('public.never_reached') AS later")).rows[0]).toEqual({ rolled_back: null, later: null });
    expect((await database.query("SELECT * FROM public.kept")).rows).toEqual([]);
    const fixed = { ...second, sql: "CREATE TABLE public.must_rollback(id int); INSERT INTO public.kept VALUES (1)" };
    expect(await applyMigrations(client, [first, fixed, third], logger)).toEqual({ applied: 2, existing: 1 });
  }, 60_000);

  it("does not run SQL against an empty or unrelated database", async () => {
    const client = await fixture({ base: false });
    await expect(applyMigrations(client, await loadMigrations(), logger)).rejects.toThrow(/platform_users is required/);
    expect((await database.query("SELECT to_regclass('moneyminds_internal.schema_migrations') AS ledger")).rows[0].ledger).toBeNull();
  }, 60_000);

  it("rolls back schema changes if saving the successful migration history fails", async () => {
    const client = await fixture();
    const first = { filename: "20261101000000_first.sql", version: "20261101000000", checksum: "first", sql: "SELECT 1" };
    await applyMigrations(client, [first], logger);
    await database.exec(`CREATE FUNCTION moneyminds_internal.reject_history() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Fixture: failed history write'; END; $$;
      CREATE TRIGGER reject_history BEFORE INSERT ON moneyminds_internal.schema_migrations FOR EACH ROW EXECUTE FUNCTION moneyminds_internal.reject_history()`);
    const next = { filename: "20261101000001_next.sql", version: "20261101000001", checksum: "next", sql: "CREATE TABLE public.not_committed(id int)" };
    await expect(applyMigrations(client, [first, next], logger)).rejects.toThrow(/next.sql failed/);
    expect((await database.query("SELECT to_regclass('public.not_committed') AS name")).rows[0].name).toBeNull();
    expect((await database.query("SELECT count(*)::int AS total FROM moneyminds_internal.schema_migrations")).rows[0].total).toBe(1);
  }, 60_000);

  it("rejects a modified recorded file before executing pending SQL", async () => {
    const client = await fixture();
    const original = { filename: "20261101000000_first.sql", version: "20261101000000", checksum: "original", sql: "CREATE TABLE public.original(id int)" };
    await applyMigrations(client, [original], logger);
    await expect(applyMigrations(client, [{ ...original, checksum: "changed", sql: "DROP TABLE public.original" }], logger)).rejects.toThrow(/history mismatch/);
    expect((await database.query("SELECT to_regclass('public.original') AS kept")).rows[0].kept).toBe("original");
  }, 60_000);

  it("does not race another deployment when its migration lock is held", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ acquired: false }] });
    await expect(applyMigrations({ query }, [], logger)).rejects.toThrow(/Another deployment/);
    expect(query).toHaveBeenCalledTimes(1);
  });
});

describe("Migration configuration and planning", () => {
  const ref = "ievzkvvidsdrlytvitup";
  const env = { SUPABASE_URL: `https://${ref}.supabase.co`, SUPABASE_DB_URL: `postgresql://postgres.${ref}:a%40b%23c@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=disable` };
  it("uses session pooling, decodes the password and always verifies TLS", () => {
    const options = connectionOptions(env);
    expect(options).toMatchObject({ port: 5432, user: `postgres.${ref}`, password: "a@b#c", database: "postgres", ssl: { rejectUnauthorized: true } });
    expect(options).not.toHaveProperty("connectionString");
    expect(connectionOptions({ ...env, SUPABASE_DB_SSL_CA: "first\\nsecond" }).ssl.ca).toBe("first\nsecond");
  });
  it("supports the project's direct connection", () => {
    expect(connectionOptions({ ...env, SUPABASE_DB_URL: `postgresql://postgres:secret@db.${ref}.supabase.co:5432/postgres` }).host).toBe(`db.${ref}.supabase.co`);
  });
  it.each([
    ["transaction pooler", env.SUPABASE_DB_URL.replace(":5432/", ":6543/"), /Session pooler/],
    ["different project", env.SUPABASE_DB_URL.replace(ref, "anotherproject"), /same hosted Supabase project/],
    ["untrusted host", "postgresql://postgres:secret@localhost:5432/postgres", /same hosted Supabase project/],
    ["missing password", `postgresql://postgres@db.${ref}.supabase.co/postgres`, /username\/password/],
  ])("rejects %s", (_label, url, message) => {
    expect(() => connectionOptions({ ...env, SUPABASE_DB_URL: url })).toThrow(message);
  });
  it("does not include a malformed secret in configuration errors", () => {
    expect(() => connectionOptions({ ...env, SUPABASE_DB_URL: "secret-never-print-me" })).toThrow(/^Set SUPABASE_DB_URL/);
  });
  it("leaves manual mode unchanged without needing database credentials", async () => {
    expect(await runMigrations({ env: {}, logger })).toEqual({ skipped: true });
    await expect(runMigrations({ env: { AUTO_MIGRATE: "maybe" }, logger })).rejects.toThrow(/true or false/);
    await expect(runMigrations({ env: { AUTO_MIGRATE: "true" }, logger })).rejects.toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });
  it("rejects missing deployed files and out-of-order pending migrations", () => {
    const first = { version: "1", filename: "1.sql", checksum: "first" };
    const next = { version: "2", filename: "2.sql", checksum: "next" };
    expect(() => planMigrations([first], [next])).toThrow(/history mismatch/);
    expect(() => planMigrations([first, next], [next])).toThrow(/predates/);
  });
});

describe("SQL transaction ownership", () => {
  it("handles comments, quoted identifiers, escaped strings and PL/pgSQL without stripping function BEGIN/END", () => {
    const sql = `-- first\nBEGIN; /* nested /* comment */ safe */
      DO $body$ BEGIN PERFORM 'COMMIT;'; END; $body$;
      SELECT 'it''s; okay', E'escaped\\\';still quoted', "a;column";
      COMMIT; -- final comment`;
    expect(migrationBody(sql)).toContain("DO $body$ BEGIN PERFORM 'COMMIT;'; END; $body$");
    expect(migrationBody(sql)).toContain('"a;column"');
  });
  it.each([
    "CREATE TABLE x(id int);",
    "BEGIN; CREATE TABLE x(id int); COMMIT; SELECT 1;",
    "BEGIN; SELECT 1; COMMIT; BEGIN; SELECT 2; COMMIT;",
    "BEGIN; SELECT 1; ROLLBACK; COMMIT;",
    "BEGIN; SELECT 'unclosed; COMMIT;",
    "BEGIN; /* unclosed comment; COMMIT;",
  ])("rejects unsafe transaction layout: %s", (sql) => expect(() => migrationBody(sql)).toThrow());
});

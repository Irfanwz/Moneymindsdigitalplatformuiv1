import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { rootCertificates } from "node:tls";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import pg from "pg";
import { migrationBody } from "./sql.js";

const root = new URL("../../supabase/", import.meta.url);
const ledger = "moneyminds_internal.schema_migrations";
const lockKey = "MoneyMinds:deployment-migrations:v1";
// Supabase's database CA is not part of Node's public Web PKI trust store.
// Ship the dashboard's public CA so deploys do not require copying PEM into env.
// This trust addition applies only to the validated Supabase migration connection.
const supabaseRootCa = readFileSync(new URL("../certs/supabase-prod-ca-2021.crt", import.meta.url), "utf8");

export async function loadMigrations(directory = root) {
  const manifest = JSON.parse(await readFile(new URL("auto-migrations.json", directory), "utf8"));
  if (manifest.version !== 1 || !Array.isArray(manifest.migrations) || !manifest.migrations.length) {
    throw new Error("Invalid automatic migration manifest");
  }
  let previous = "";
  return Promise.all(manifest.migrations.map(async (filename) => {
    if (typeof filename !== "string" || !/^\d{14}_[a-z0-9_]+\.sql$/.test(filename) || filename.slice(0, 14) <= previous) {
      throw new Error("Migration filenames must be unique and ordered by their 14-digit version");
    }
    previous = filename.slice(0, 14);
    // Git checkouts on Windows and Linux must produce the same checksum.
    const sql = (await readFile(new URL(`migrations/${filename}`, directory), "utf8")).replace(/\r\n/g, "\n");
    return { filename, version: filename.slice(0, 14), checksum: createHash("sha256").update(sql).digest("hex"), sql: migrationBody(sql) };
  }));
}

export function connectionOptions(env) {
  let database;
  let project;
  try {
    database = new URL(env.SUPABASE_DB_URL);
    project = new URL(env.SUPABASE_URL);
  } catch {
    throw new Error("Set SUPABASE_DB_URL to the Postgres connection string and SUPABASE_URL to the matching project URL");
  }
  if (!["postgres:", "postgresql:"].includes(database.protocol) || !database.username || !database.password || database.pathname !== "/postgres") {
    throw new Error("SUPABASE_DB_URL must be a Postgres connection string with a database username/password and /postgres database");
  }
  // The advisory lock belongs to one session. Transaction pooling is unsuitable.
  if (database.port && database.port !== "5432") {
    throw new Error("Use the Supabase direct connection or Session pooler on port 5432, not the Transaction pooler");
  }
  const ref = project.hostname.match(/^([a-z0-9]+)\.supabase\.co$/)?.[1];
  const direct = database.hostname === `db.${ref}.supabase.co`;
  const pooled = /^[a-z0-9-]+\.pooler\.supabase\.com$/.test(database.hostname) && decodeURIComponent(database.username).endsWith(`.${ref}`);
  if (!ref || project.protocol !== "https:" || (!direct && !pooled)) {
    throw new Error("SUPABASE_DB_URL must connect to the same hosted Supabase project as SUPABASE_URL");
  }
  // Pass parsed fields explicitly: URL sslmode=require must not overwrite TLS
  // certificate validation or the optional project CA in node-postgres.
  return {
    host: database.hostname,
    port: 5432,
    user: decodeURIComponent(database.username),
    password: decodeURIComponent(database.password),
    database: "postgres",
    ssl: {
      rejectUnauthorized: true,
      ca: env.SUPABASE_DB_SSL_CA?.trim()
        ? env.SUPABASE_DB_SSL_CA.replace(/\\n/g, "\n")
        : [...rootCertificates, supabaseRootCa],
    },
    connectionTimeoutMillis: 15_000,
    statement_timeout: 60_000,
    idle_in_transaction_session_timeout: 60_000,
    application_name: "moneyminds-migrations",
  };
}

async function history(client) {
  const { rows } = await client.query("SELECT to_regclass($1) AS name", [ledger]);
  if (!rows[0].name) return [];
  return (await client.query(`SELECT version, filename, checksum FROM ${ledger} ORDER BY version`)).rows;
}

export function planMigrations(migrations, applied) {
  for (const row of applied) {
    const file = migrations.find((migration) => migration.version === row.version);
    if (!file || file.filename !== row.filename || file.checksum !== row.checksum) {
      throw new Error(`Migration history mismatch at ${row.version}. Restore the deployed file and append a new migration; do not edit applied SQL`);
    }
  }
  const latest = applied.at(-1)?.version ?? "";
  const pending = migrations.filter((file) => !applied.some((row) => row.version === file.version));
  if (pending.some((file) => file.version < latest)) throw new Error("A pending migration predates applied history. Append a new version instead");
  return pending;
}

export async function applyMigrations(client, migrations, logger = console) {
  const { rows } = await client.query("SELECT pg_try_advisory_lock(hashtext($1)) AS acquired", [lockKey]);
  if (!rows[0].acquired) throw new Error("Another deployment is applying migrations. Wait for it to finish and retry");
  try {
    const base = await client.query("SELECT to_regclass('public.platform_users') AS name");
    if (!base.rows[0].name) throw new Error("Existing public.platform_users is required. This runner upgrades MoneyMinds; it does not initialize an empty database");
    const pending = planMigrations(migrations, await history(client));
    await client.query("BEGIN");
    try {
      await client.query(`
        CREATE SCHEMA IF NOT EXISTS moneyminds_internal;
        REVOKE ALL ON SCHEMA moneyminds_internal FROM PUBLIC, anon, authenticated, service_role;
        CREATE TABLE IF NOT EXISTS ${ledger} (
          version text PRIMARY KEY, filename text NOT NULL UNIQUE,
          checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
        );
        ALTER TABLE ${ledger} ENABLE ROW LEVEL SECURITY;
        REVOKE ALL ON ${ledger} FROM PUBLIC, anon, authenticated, service_role;
      `);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
    for (const migration of pending) {
      logger.info(`[migrations] Applying ${migration.filename}`);
      await client.query("BEGIN");
      try {
        await client.query("SET LOCAL lock_timeout = '5s'; SET LOCAL statement_timeout = '60s'; SET LOCAL search_path = public, pg_catalog; SET LOCAL standard_conforming_strings = on");
        await client.query(migration.sql);
        await client.query(`INSERT INTO ${ledger}(version, filename, checksum) VALUES ($1, $2, $3)`, [migration.version, migration.filename, migration.checksum]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw new Error(`Migration ${migration.filename} failed (${safeCode(error)}). App startup stopped; retry will check saved history before continuing`);
      }
      logger.info(`[migrations] Applied ${migration.filename}`);
    }
    logger.info(`[migrations] Ready: ${pending.length} applied, ${migrations.length - pending.length} already recorded`);
    return { applied: pending.length, existing: migrations.length - pending.length };
  } finally {
    await client.query("SELECT pg_advisory_unlock(hashtext($1))", [lockKey]).catch(() => {});
  }
}

function safeCode(error) {
  return /^[A-Z0-9_]{3,50}$/.test(error?.code ?? "") ? error.code : "database error";
}

export async function runMigrations({ env = process.env, force = false, statusOnly = false, logger = console } = {}) {
  const setting = env.AUTO_MIGRATE?.trim().toLowerCase() ?? "false";
  if (!["true", "false", ""].includes(setting)) throw new Error("AUTO_MIGRATE must be true or false");
  if (!force && !statusOnly && setting !== "true") {
    logger.info("[migrations] Manual mode (AUTO_MIGRATE is not true)");
    return { skipped: true };
  }
  if (!force && !statusOnly && !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Automatic migrations require SUPABASE_SERVICE_ROLE_KEY for the app's Supabase storage; memory mode cannot use automatic migrations");
  }
  const options = connectionOptions(env);
  const migrations = await loadMigrations();
  const client = new pg.Client(options);
  // Avoid unhandled idle-client errors; subsequent queries still reject.
  client.on("error", () => {});
  try {
    try { await client.connect(); }
    catch (error) { throw new Error(`Migration connection failed (${safeCode(error)}). Check SUPABASE_DB_URL, database password, network and SUPABASE_DB_SSL_CA; no migrations applied`); }
    if (statusOnly) {
      const pending = planMigrations(migrations, await history(client));
      for (const file of migrations) logger.info(`[migrations] ${pending.includes(file) ? "PENDING" : "APPLIED"} ${file.filename}`);
      return { pending: pending.length };
    }
    return await applyMigrations(client, migrations, logger);
  } finally {
    await client.end().catch(() => {});
  }
}

// Also usable inside the deployed container, without starting the app or agents.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { default: dotenv } = await import("dotenv");
  dotenv.config();
  runMigrations({ force: true, statusOnly: process.argv.includes("--status") }).catch((error) => {
    console.error(`[migrations] ${error.message}`);
    process.exitCode = 1;
  });
}

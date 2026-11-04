import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { agentSchema } from "../server/store/agentStore.js";

const repair = readFileSync(new URL("../supabase/migrations/20261101084337_repair_agent_runtime.sql", import.meta.url), "utf8");
const usageMigration = readFileSync(new URL("../supabase/migrations/20261104182053_agent_token_usage.sql", import.meta.url), "utf8");
const base = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");
const userTable = base.match(/create table if not exists public\.platform_users[\s\S]*?\n\);/i)[0];

describe("Production agent repair SQL", () => {
  it("restores missing tables, preserves existing signals, and can run twice", async () => {
    const db = new PGlite();
    try {
      await db.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;");
      await db.exec(userTable);
      await db.exec(repair);
      const user = (await db.query("INSERT INTO platform_users(full_name,email,password_hash) VALUES ('Fixture','fixture@example.test','unused') RETURNING id")).rows[0];
      const group = (await db.query("INSERT INTO advisor_groups(advisor_id,name,description,category) VALUES ($1,'Fixture','Fixture','crypto') RETURNING id", [user.id])).rows[0];
      await db.query("INSERT INTO advisor_signals(advisor_id,group_id,title,content,signal_type) VALUES ($1,$2,'Existing signal','Keep this content','buy')", [user.id, group.id]);
      // Reproduce an app with core data but missing the agent migrations.
      await db.exec("DROP TABLE ai_verifications; ALTER TABLE advisor_signals DROP COLUMN sentiment; ALTER TABLE advisor_signals DROP COLUMN prediction_ticker;");
      await db.exec(repair);
      await db.exec(repair);
      await db.query("INSERT INTO agent_runs(user_id,agent_key,status) VALUES ($1,'legacy-fixture','completed')", [user.id]);
      await db.exec(usageMigration);
      await db.exec(usageMigration);
      expect((await db.query("SELECT usage FROM agent_runs WHERE agent_key='legacy-fixture'")).rows[0].usage).toBeNull();
      const usage = {version:1,status:"complete",totalTokens:125,calls:[{provider:"groq",inputTokens:100,outputTokens:25}]};
      await db.query("UPDATE agent_runs SET usage=$1::jsonb WHERE agent_key='legacy-fixture'", [JSON.stringify(usage)]);
      expect((await db.query("SELECT usage FROM agent_runs WHERE agent_key='legacy-fixture'")).rows[0].usage).toEqual(usage);
      expect((await db.query("SELECT content FROM advisor_signals")).rows).toEqual([{content:"Keep this content"}]);
      for (const [table, columns] of Object.entries(agentSchema)) {
        const present = (await db.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1", [table])).rows.map(r=>r.column_name);
        expect(present, table).toEqual(expect.arrayContaining(columns.split(",")));
      }
      const access = (await db.query("SELECT has_table_privilege('anon','agent_runs','SELECT') AS anonymous, has_table_privilege('authenticated','agent_runs','SELECT') AS authenticated, has_table_privilege('service_role','agent_runs','INSERT') AS server")).rows[0];
      expect(access).toEqual({anonymous:false,authenticated:false,server:true});
      await db.query("INSERT INTO agent_runs(user_id,agent_key) VALUES ($1,'investor-1')", [user.id]);
      await expect(db.query("INSERT INTO agent_runs(user_id,agent_key) VALUES ($1,'investor-1')", [user.id])).rejects.toThrow(/duplicate/i);
      await db.exec("UPDATE agent_runs SET status='completed'");
      await db.query("INSERT INTO agent_runs(user_id,agent_key) VALUES ($1,'investor-1')", [user.id]);
    } finally { await db.close(); }
  }, 60000);
});

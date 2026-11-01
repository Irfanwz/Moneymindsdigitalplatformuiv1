import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const users = read("../supabase/schema.sql").match(
  /create table if not exists public\.platform_users[\s\S]*?\n\);/i,
)[0];
const repair = read(
  "../supabase/migrations/20261101084337_repair_agent_runtime.sql",
);
const migration = read(
  "../supabase/migrations/20261101101357_admin_console.sql",
);
describe("Admin console SQL migration", () => {
  it("is repeatable, preserves rows, restricts access and commits mutations with audit records", async () => {
    const db = new PGlite();
    try {
      await db.exec(
        "CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;",
      );
      await db.exec(users);
      await db.exec(repair);
      const admin = (
        await db.query(
          "INSERT INTO platform_users(full_name,email,password_hash,is_admin,status) VALUES ('Admin','admin@example.test','unchanged',true,'approved') RETURNING id",
        )
      ).rows[0].id;
      const user = (
        await db.query(
          "INSERT INTO platform_users(full_name,email,password_hash) VALUES ('User','user@example.test','unchanged') RETURNING id",
        )
      ).rows[0].id;
      await db.exec(migration);
      await db.exec(migration);
      expect(
        (
          await db.query(read("../supabase/admin_console_audit.sql"))
        ).rows.every((r) => r.status === "READY"),
      ).toBe(true);
      expect(
        (
          await db.query(
            "SELECT has_table_privilege('service_role','admin_audit_events','DELETE') AS can_delete",
          )
        ).rows[0].can_delete,
      ).toBe(false);
      const access = (
        await db.query(
          "SELECT has_table_privilege('anon','admin_audit_events','SELECT') AS anonymous,has_table_privilege('authenticated','admin_reviews','SELECT') AS authenticated,has_function_privilege('anon','admin_console_mutation(uuid,text,text,jsonb)','EXECUTE') AS rpc_public,has_function_privilege('service_role','admin_console_mutation(uuid,text,text,jsonb)','EXECUTE') AS rpc_server",
        )
      ).rows[0];
      expect(access).toEqual({
        anonymous: false,
        authenticated: false,
        rpc_public: false,
        rpc_server: true,
      });
      const mutate = (actor, action, target, payload) =>
        db.query("SELECT public.admin_console_mutation($1,$2,$3,$4::jsonb)", [
          actor,
          action,
          target,
          JSON.stringify(payload),
        ]);
      await mutate(admin, "settings.update", "platform", {
        registrationOpen: true,
        maintenanceMode: false,
        requireBackgroundCheck: true,
      });
      await expect(
        mutate(admin, "user.approval", user, {
          status: "approved",
          approvedRoles: ["startup"],
        }),
      ).rejects.toThrow(/background check/i);
      expect(
        (
          await db.query(
            "SELECT count(*)::int AS count FROM admin_audit_events",
          )
        ).rows[0].count,
      ).toBe(1);
      await db.query(
        "INSERT INTO ai_verifications(user_id,status) VALUES ($1,'complete')",
        [user],
      );
      await mutate(admin, "user.approval", user, {
        status: "approved",
        approvedRoles: ["startup"],
        adminNotes: "Reviewed",
      });
      await mutate(admin, "review.update", user, {
        assignedTo: admin,
        state: "in_review",
        notes: "Evidence checked",
      });
      await mutate(admin, "user.suspension", user, {
        suspended: true,
        reason: "Review needed",
      });
      await expect(
        mutate(admin, "user.admin_role", user, { role: "finance" }),
      ).rejects.toThrow(/reactivate/i);
      await mutate(admin, "user.suspension", user, {
        suspended: false,
        reason: "Resolved",
      });
      await mutate(admin, "user.admin_role", user, { role: "finance" });
      await expect(
        mutate(user, "settings.update", "platform", {
          registrationOpen: false,
          maintenanceMode: true,
          requireBackgroundCheck: false,
        }),
      ).rejects.toThrow(/permission/i);
      await expect(
        mutate(admin, "user.admin_role", admin, { role: null }),
      ).rejects.toThrow(/own admin/i);
      const group = (
        await db.query(
          "INSERT INTO advisor_groups(advisor_id,name) VALUES ($1,'Fixture') RETURNING id",
          [user],
        )
      ).rows[0].id;
      await mutate(admin, "content.moderate", group, {
        entityType: "group",
        hidden: true,
        reason: "Needs correction",
      });
      const doc = (
        await db.query(
          "INSERT INTO profile_verifications(user_id,doc_type,doc_url,claim_to_verify) VALUES ($1,'certificate','https://example.test/doc','Qualification') RETURNING id",
          [user],
        )
      ).rows[0].id;
      await db.query("INSERT INTO advisor_profiles(user_id) VALUES ($1)", [
        user,
      ]);
      await mutate(admin, "document.decision", doc, {
        status: "verified",
        note: "Reviewed",
      });
      expect(
        (await db.query("SELECT is_verified FROM advisor_profiles")).rows[0]
          .is_verified,
      ).toBe(true);
      await mutate(admin, "document.decision", doc, {
        status: "rejected",
        note: "Withdrawn",
      });
      expect(
        (await db.query("SELECT is_verified FROM advisor_profiles")).rows[0]
          .is_verified,
      ).toBe(false);
      expect(
        (
          await db.query(
            "SELECT count(*)::int AS count FROM platform_users WHERE password_hash='unchanged'",
          )
        ).rows[0].count,
      ).toBe(2);
      expect(
        (
          await db.query(
            "SELECT count(*)::int AS count FROM admin_audit_events",
          )
        ).rows[0].count,
      ).toBe(9);
      // Model the app's service role rather than only testing as the DB owner.
      await db.exec(
        "GRANT SELECT, UPDATE ON platform_users TO service_role; SET ROLE service_role;",
      );
      await mutate(admin, "settings.update", "platform", {
        registrationOpen: true,
        maintenanceMode: false,
        requireBackgroundCheck: false,
      });
      expect(
        (
          await db.query(
            "SELECT count(*)::int AS count FROM admin_audit_events",
          )
        ).rows[0].count,
      ).toBe(10);
      await expect(db.exec("DELETE FROM admin_audit_events")).rejects.toThrow(
        /permission denied/i,
      );
      const purchase = (payer, amount = 25) =>
        db.query(
          "SELECT public.record_confirmed_checkout($1,$2,$3,$4,$5,$6) AS receipt",
          [payer, "group_join", group, amount, "USD", "pi_sql_fixture"],
        );
      expect((await purchase(user)).rows[0].receipt.created).toBe(true);
      expect((await purchase(user)).rows[0].receipt.created).toBe(false);
      await expect(purchase(admin)).rejects.toThrow(/another purchase/i);
      expect(
        (await db.query("SELECT count(*)::int AS count FROM payments")).rows[0]
          .count,
      ).toBe(1);
      expect(
        (
          await db.query(
            "SELECT member_count FROM advisor_groups WHERE id=$1",
            [group],
          )
        ).rows[0].member_count,
      ).toBe(1);
      expect(
        (
          await db.query(
            "SELECT has_function_privilege('anon','record_confirmed_checkout(uuid,text,text,numeric,text,text)','EXECUTE') AS public_access",
          )
        ).rows[0].public_access,
      ).toBe(false);
      await db.exec("RESET ROLE;");
    } finally {
      await db.close();
    }
  }, 60000);
});

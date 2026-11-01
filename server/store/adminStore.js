import { randomUUID } from "node:crypto";
import {
  adminCan,
  ADMIN_ACTION_PERMISSIONS,
  ADMIN_ROLES,
  DEFAULT_ADMIN_SETTINGS,
} from "../../shared/adminPermissions.js";

const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};
const camel = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      v,
    ]),
  );
const contentTables = {
  group: "advisor_groups",
  signal: "advisor_signals",
  comment: "signal_comments",
  training: "trainings",
};
const contentArrays = {
  group: "advisorGroups",
  signal: "advisorSignals",
  comment: "signalComments",
  training: "trainings",
};

// Both adapters expose the same admin contract. Supabase mutations and audit
// writes are atomic in admin_console_mutation; no browser receives service keys.
export function createAdminStore(client = null, data = {}) {
  let settings = { ...DEFAULT_ADMIN_SETTINGS };
  const audits = [],
    reviews = [],
    moderation = [];
  async function rows(table, query = (q) => q) {
    const output = [];
    for (let offset = 0; ; offset += 500) {
      const { data: page, error } = await query(client.from(table).select("*"))
        .order(
          table === "admin_reviews"
            ? "user_id"
            : table === "content_moderation"
              ? "entity_id"
              : "id",
        )
        .range(offset, offset + 499);
      if (error) throw error;
      output.push(...page.map(camel));
      if (page.length < 500) return output;
    }
  }
  const api = {
    async getAdminSettings() {
      if (!client) return { ...settings };
      const { data: row, error } = await client
        .from("platform_settings")
        .select("value")
        .eq("key", "admin_console")
        .maybeSingle();
      if (error) throw error;
      const saved = row ? JSON.parse(row.value) : {};
      return { ...DEFAULT_ADMIN_SETTINGS, ...saved };
    },
    async listAdminAudit() {
      if (!client) return structuredClone(audits).reverse();
      const { data: items, error } = await client
        .from("admin_audit_events")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id")
        .limit(500);
      if (error) throw error;
      return items.map(camel);
    },
    async listAdminReviews() {
      return client ? rows("admin_reviews") : structuredClone(reviews);
    },
    async listAdminPayments() {
      const payments = client
        ? await rows("payments")
        : structuredClone(data.payments);
      return payments.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async listContentModeration() {
      return client ? rows("content_moderation") : structuredClone(moderation);
    },
    async listAdminContent() {
      const flags = await api.listContentModeration();
      const groups = await Promise.all(
        Object.entries(contentTables).map(async ([type, table]) => {
          const items = client ? await rows(table) : data[contentArrays[type]];
          return items.map((item) => ({
            id: item.id,
            type,
            title: item.title || item.name || item.content,
            content: item.description || item.content || "",
            ownerId: item.advisorId || item.userId,
            groupId: item.groupId,
            createdAt: item.createdAt,
            ...(flags.find(
              (f) => f.entityType === type && f.entityId === item.id,
            ) || { hidden: false, reason: "" }),
          }));
        }),
      );
      return structuredClone(
        groups.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    },
    async adminMutate(actorId, action, targetId, payload) {
      if (!ADMIN_ACTION_PERMISSIONS[action]) fail("Unknown admin action.");
      if (
        action !== "settings.update" &&
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          targetId,
        )
      )
        fail("A valid record identifier is required.");
      for (const key of [
        "reason",
        "notes",
        "note",
        "adminNotes",
        "rejectionReason",
      ])
        if (payload[key] != null && typeof payload[key] !== "string")
          fail("Notes and reasons must be text.");
      if (action === "settings.update") {
        if (
          Object.keys(payload).length !== 3 ||
          Object.keys(DEFAULT_ADMIN_SETTINGS).some(
            (k) => typeof payload[k] !== "boolean",
          )
        )
          fail("Invalid settings.");
      }
      if (
        action === "user.suspension" &&
        (typeof payload.suspended !== "boolean" ||
          typeof payload.reason !== "string" ||
          (payload.suspended && !payload.reason.trim()))
      )
        fail("A suspension reason and a true/false status are required.");
      if (
        action === "user.admin_role" &&
        payload.role !== null &&
        !ADMIN_ROLES.includes(payload.role)
      )
        fail("Invalid administrator role.");
      if (action === "user.approval") {
        if (!["approved", "rejected"].includes(payload.status))
          fail("Invalid approval status.");
        if (
          payload.status === "approved" &&
          (!Array.isArray(payload.approvedRoles) ||
            !payload.approvedRoles.length ||
            payload.approvedRoles.some(
              (r) => !["startup", "investor", "advisor"].includes(r),
            ))
        )
          fail("Select at least one valid role.");
        if (payload.status === "rejected" && !payload.rejectionReason?.trim())
          fail("A rejection reason is required.");
      }
      if (
        action === "review.update" &&
        (!["open", "in_review", "resolved"].includes(payload.state) ||
          typeof payload.notes !== "string" ||
          !(
            payload.assignedTo === null ||
            typeof payload.assignedTo === "string"
          ))
      )
        fail("Invalid review status, notes or reviewer.");
      if (
        action === "content.moderate" &&
        (!contentTables[payload.entityType] ||
          typeof payload.hidden !== "boolean" ||
          !payload.reason?.trim())
      )
        fail("Select valid content and provide a moderation reason.");
      if (
        action === "document.decision" &&
        (!["verified", "rejected"].includes(payload.status) ||
          (payload.status === "rejected" && !payload.note?.trim()))
      )
        fail("A valid document decision and rejection reason are required.");
      for (const value of Object.values(payload))
        if (typeof value === "string" && value.length > 5000)
          fail("Notes must be 5,000 characters or less.");

      if (client) {
        const { error } = await client.rpc("admin_console_mutation", {
          actor_id: actorId,
          action_kind: action,
          target_id: targetId,
          payload,
        });
        if (error)
          throw Object.assign(new Error(error.message), {
            status:
              error.code === "42501" ? 403 : error.code === "P0001" ? 400 : 500,
          });
        return;
      }
      const actor = data.users.find((u) => u.id === actorId);
      if (!adminCan(actor, ADMIN_ACTION_PERMISSIONS[action]))
        fail("You do not have permission for this action.", 403);
      const now = new Date().toISOString();
      const target = data.users.find((u) => u.id === targetId);
      if (action.startsWith("user.") || action === "review.update") {
        if (!target) fail("User not found.", 404);
      }
      if (action === "settings.update") settings = { ...payload };
      if (action === "user.suspension") {
        if (
          target.id === actorId ||
          (target.isAdmin &&
            (actor.adminRole || "super_admin") !== "super_admin")
        )
          fail("Cannot suspend this administrator.", 403);
        Object.assign(target, {
          isSuspended: payload.suspended,
          suspensionReason: payload.reason,
          suspendedAt: payload.suspended ? now : null,
          updatedAt: now,
        });
      }
      if (action === "user.admin_role") {
        if (target.id === actorId)
          fail("You cannot change your own admin access.");
        if (
          payload.role &&
          (target.status !== "approved" || target.isSuspended)
        )
          fail("Approve and reactivate the account first.");
        Object.assign(target, {
          isAdmin: !!payload.role,
          adminRole: payload.role || "super_admin",
          updatedAt: now,
        });
      }
      if (action === "user.approval") {
        if (target.isAdmin)
          fail("Use administrator access controls for admin accounts.");
        if (
          payload.status === "approved" &&
          settings.requireBackgroundCheck &&
          !data.verifications.some(
            (v) => v.userId === targetId && v.status === "complete",
          )
        )
          fail("Complete the background check before approving this account.");
        Object.assign(target, {
          status: payload.status,
          approvedRoles:
            payload.status === "approved" ? [...payload.approvedRoles] : [],
          adminNotes: payload.adminNotes,
          rejectionReason:
            payload.status === "rejected" ? payload.rejectionReason : null,
          approvedAt: payload.status === "approved" ? now : null,
          approvedBy: actorId,
          updatedAt: now,
        });
      }
      if (action === "review.update") {
        if (
          payload.assignedTo &&
          !adminCan(
            data.users.find((u) => u.id === payload.assignedTo),
            "reviews",
          )
        )
          fail("Select an active reviewer.");
        const row = {
          userId: targetId,
          assignedTo: payload.assignedTo,
          state: payload.state,
          notes: payload.notes,
          updatedBy: actorId,
          updatedAt: now,
        };
        const old = reviews.find((r) => r.userId === targetId);
        if (old) Object.assign(old, row);
        else reviews.push(row);
      }
      if (action === "content.moderate") {
        if (
          !data[contentArrays[payload.entityType]].some(
            (c) => c.id === targetId,
          )
        )
          fail("Content not found.", 404);
        const row = {
          entityType: payload.entityType,
          entityId: targetId,
          hidden: payload.hidden,
          reason: payload.reason,
          updatedBy: actorId,
          updatedAt: now,
        };
        const old = moderation.find(
          (r) => r.entityType === row.entityType && r.entityId === targetId,
        );
        if (old) Object.assign(old, row);
        else moderation.push(row);
      }
      if (action === "document.decision") {
        const doc = data.profileVerifications.find((d) => d.id === targetId);
        if (!doc) fail("Document not found.", 404);
        Object.assign(doc, {
          status: payload.status,
          reviewedBy: actorId,
          reviewedAt: now,
          adminNote: payload.note,
          updatedAt: now,
        });
        for (const profiles of [
          data.startupProfiles,
          data.investorProfiles,
          data.advisorProfiles,
        ]) {
          for (const p of profiles) {
            if (p.userId === doc.userId && payload.status === "verified")
              Object.assign(p, {
                isVerified: true,
                verifiedAt: now,
                verificationId: doc.id,
              });
            if (p.verificationId === doc.id && payload.status === "rejected")
              Object.assign(p, {
                isVerified: false,
                verifiedAt: null,
                verificationId: null,
              });
          }
        }
      }
      audits.push({
        id: randomUUID(),
        actorId,
        actorName: actor.fullName,
        action,
        targetId,
        details: structuredClone(payload),
        createdAt: now,
      });
    },
  };
  return api;
}

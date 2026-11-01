export const ADMIN_ROLES = ["super_admin", "reviewer", "support", "finance"];
export const ADMIN_PERMISSIONS = {
  super_admin: ["*"],
  reviewer: ["overview", "users.read", "reviews", "agents"],
  support: ["overview", "users.read", "users.suspend", "content"],
  finance: ["overview", "payments", "reports"],
};
export function adminCan(user, permission) {
  if (!user?.isAdmin || user.isSuspended) return false;
  const permissions = ADMIN_PERMISSIONS[user.adminRole || "super_admin"] || [];
  return permissions.includes("*") || permissions.includes(permission);
}
export const DEFAULT_ADMIN_SETTINGS = {
  registrationOpen: true,
  maintenanceMode: false,
  requireBackgroundCheck: false,
};
export const ADMIN_ACTION_PERMISSIONS = {
  "settings.update": "settings",
  "user.suspension": "users.suspend",
  "user.admin_role": "settings",
  "user.approval": "reviews",
  "review.update": "reviews",
  "content.moderate": "content",
  "document.decision": "reviews",
};

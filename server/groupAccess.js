import { adminCan } from "../shared/adminPermissions.js";

export function canManageGroupContent(user, group) {
  return Boolean(group && (group.advisorId === user?.id || adminCan(user, "content") || adminCan(user, "agents")));
}

export async function canReadGroupContent(store, user, group) {
  if (!group || !user) return false;
  if (canManageGroupContent(user, group)) return true;
  const memberships = await store.listUserMemberships(user.id);
  if (!memberships.some(member => member.groupId === group.id)) return false;
  if (!group.isPaid || !(Number(group.joiningFee) > 0 || Number(group.monthlyFee) > 0)) return true;
  return await store.hasActivePayment(user.id, "group_join", group.id)
    || await store.hasActivePayment(user.id, "group_monthly", group.id);
}

// Private groups have no invitation redemption workflow yet. Do not grant
// membership (including via checkout) merely because someone knows the ID.
export async function canSelfJoinGroup(store, user, group) {
  if (!group?.isPrivate || group.advisorId === user?.id) return true;
  return (await store.listUserMemberships(user.id)).some(member => member.groupId === group.id);
}

export function requireSignalAccess(store) {
  return async (req, res, next) => {
    try {
      const signal = await store.findSignalById(req.params.signalId);
      const group = signal && await store.findGroupById(signal.groupId);
      if (!await canReadGroupContent(store, req.currentUser, group)) {
        return res.status(404).json({ message: "Signal not found." });
      }
      req.signal = signal;
      req.matchedSignal = signal;
      next();
    } catch (error) { next(error); }
  };
}

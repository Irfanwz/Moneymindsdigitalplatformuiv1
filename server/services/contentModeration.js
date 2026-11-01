const wrapped = new WeakSet();
// All customer-facing reads go through these store methods, including checkout.
// Admin inventory uses separate unfiltered methods so hidden content is recoverable.
export function applyContentModeration(store) {
  if (wrapped.has(store)) return;
  wrapped.add(store);
  const methods = {
    group: ["findGroupById", "listPublicGroups", "listGroupsByAdvisor"],
    signal: [
      "findSignalById",
      "listAllSignals",
      "listSignalsByGroup",
      "listSignalsByAdvisor",
      "listSignalsDueForCheck",
    ],
    comment: ["findCommentById", "listCommentsBySignal"],
    training: ["findTrainingById", "listTrainings", "listTrainingsByAdvisor"],
  };
  for (const [type, names] of Object.entries(methods))
    for (const name of names) {
      const original = store[name].bind(store);
      store[name] = async (...args) => {
        const [result, flags] = await Promise.all([
          original(...args),
          store.listContentModeration(),
        ]);
        const hidden = (kind, id) =>
          flags.some(
            (f) => f.hidden && f.entityType === kind && f.entityId === id,
          );
        const visible = (item) =>
          item &&
          !hidden(type, item.id) &&
          !(item.groupId && hidden("group", item.groupId)) &&
          !(item.signalId && hidden("signal", item.signalId));
        return Array.isArray(result)
          ? result.filter(visible)
          : visible(result)
            ? result
            : null;
      };
    }
}

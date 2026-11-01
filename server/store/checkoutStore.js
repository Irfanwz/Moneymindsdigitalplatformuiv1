import { randomUUID } from "node:crypto";
const camel = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      v,
    ]),
  );
export function createCheckoutStore(client = null, data = {}) {
  return {
    async recordCheckout({
      userId,
      itemType,
      itemId,
      amount,
      currency = "USD",
      transactionRef,
    }) {
      if (client) {
        const { data: result, error } = await client.rpc(
          "record_confirmed_checkout",
          {
            payer_id: userId,
            purchase_type: itemType,
            purchase_id: itemId,
            paid_amount: amount,
            paid_currency: currency,
            provider_reference: transactionRef,
          },
        );
        if (error) throw error;
        return { payment: camel(result.payment), created: result.created };
      }
      const existing = data.payments.find(
        (p) => p.transactionRef === transactionRef,
      );
      if (existing) {
        if (
          existing.userId !== userId ||
          existing.itemType !== itemType ||
          existing.itemId !== itemId ||
          Number(existing.amount) !== Number(amount) ||
          existing.currency.toUpperCase() !== currency.toUpperCase()
        )
          throw new Error(
            "Payment reference already belongs to another purchase.",
          );
        return { payment: { ...existing }, created: false };
      }
      const now = new Date().toISOString();
      const collection =
        itemType === "training" ? data.trainings : data.advisorGroups;
      const item = collection.find((i) => i.id === itemId);
      if (!item) throw new Error("Purchased item no longer exists.");
      const payment = {
        id: randomUUID(),
        userId,
        itemType,
        itemId,
        amount,
        currency: currency.toUpperCase(),
        status: "completed",
        paymentMethod: "card",
        transactionRef,
        createdAt: now,
        updatedAt: now,
      };
      // Synchronous writes mirror the single PostgreSQL transaction.
      if (itemType === "training") {
        if (
          !data.trainingEnrollments.some(
            (e) => e.trainingId === itemId && e.userId === userId,
          )
        ) {
          data.trainingEnrollments.push({
            id: randomUUID(),
            trainingId: itemId,
            userId,
            progress: 0,
            enrolledAt: now,
          });
          item.enrolled++;
        }
      } else if (
        !data.advisorGroupMembers.some(
          (m) => m.groupId === itemId && m.userId === userId,
        )
      ) {
        data.advisorGroupMembers.push({
          id: randomUUID(),
          groupId: itemId,
          userId,
          role: "member",
          joinedAt: now,
        });
        item.memberCount++;
      }
      data.payments.push(payment);
      return { payment: { ...payment }, created: true };
    },
  };
}

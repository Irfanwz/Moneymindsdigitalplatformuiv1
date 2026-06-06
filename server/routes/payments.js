import express, { Router } from "express";
import { config, isStripeConfigured } from "../config.js";
import { sendPaymentReceiptEmail } from "../email.js";
import { createAuthenticate } from "../middleware/auth.js";
import { validate, checkoutSchema, createIntentSchema } from "../schemas.js";
import { paginate, trimText } from "../utils.js";

export function createPaymentsRouter(store) {
  const router = Router();
  const authenticate = createAuthenticate(store);

  // Helper to resolve item amount
  async function resolveAmount(itemType, itemId) {
    if (itemType === "training") {
      const training = await store.findTrainingById(itemId);
      if (!training) throw Object.assign(new Error("Training not found."), { status: 404 });
      if (training.type !== "paid") throw Object.assign(new Error("This training is free."), { status: 400 });
      return training.price;
    }
    const group = await store.findGroupById(itemId);
    if (!group) throw Object.assign(new Error("Group not found."), { status: 404 });
    if (!group.isPaid) throw Object.assign(new Error("This group is free."), { status: 400 });
    return parseFloat(itemType === "group_join" ? group.joiningFee || "0" : group.monthlyFee || "0");
  }

  // Create Stripe PaymentIntent (or return simulated flag)
  router.post("/create-intent", authenticate, validate(createIntentSchema), async (req, res, next) => {
    try {
      const itemType = trimText(req.body?.itemType);
      const itemId = trimText(req.body?.itemId);

      if (!["group_join", "group_monthly", "training"].includes(itemType)) {
        return res.status(400).json({ message: "Invalid payment type." });
      }
      if (!itemId) return res.status(400).json({ message: "Item ID is required." });

      const alreadyPaid = await store.hasActivePayment(req.auth.userId, itemType, itemId);
      if (alreadyPaid) return res.status(400).json({ message: "You have already paid for this item." });

      let amount;
      try {
        amount = await resolveAmount(itemType, itemId);
      } catch (err) {
        return res.status(err.status || 400).json({ message: err.message });
      }

      if (amount <= 0) return res.status(400).json({ message: "No payment required." });

      if (!isStripeConfigured) {
        return res.json({ clientSecret: null, simulated: true, amount, currency: "usd", message: "Stripe not configured. Payment will be simulated." });
      }

      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(config.stripeSecretKey);
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        metadata: { userId: req.auth.userId, itemType, itemId },
      });

      res.json({ clientSecret: intent.client_secret, amount, currency: "usd", simulated: false });
    } catch (error) { next(error); }
  });

  // Complete payment after Stripe confirmation (or simulation)
  router.post("/checkout", authenticate, validate(checkoutSchema), async (req, res, next) => {
    try {
      const itemType = trimText(req.body?.itemType);
      const itemId = trimText(req.body?.itemId);
      const paymentMethod = trimText(req.body?.paymentMethod) || "card";
      const stripePaymentIntentId = trimText(req.body?.stripePaymentIntentId);

      if (!["group_join", "group_monthly", "training"].includes(itemType)) {
        return res.status(400).json({ message: "Invalid payment type." });
      }
      if (!itemId) return res.status(400).json({ message: "Item ID is required." });

      const alreadyPaid = await store.hasActivePayment(req.auth.userId, itemType, itemId);
      if (alreadyPaid) return res.status(400).json({ message: "You have already paid for this item." });

      let amount;
      try {
        amount = await resolveAmount(itemType, itemId);
      } catch (err) {
        return res.status(err.status || 400).json({ message: err.message });
      }

      if (amount <= 0) return res.status(400).json({ message: "No payment required." });

      let transactionId;
      if (isStripeConfigured && stripePaymentIntentId) {
        const { default: Stripe } = await import("stripe");
        const stripe = new Stripe(config.stripeSecretKey);
        const intent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
        if (intent.status !== "succeeded") return res.status(400).json({ message: "Payment has not been completed." });
        transactionId = intent.id;
      } else {
        transactionId = `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      }

      const payment = await store.createPayment(req.auth.userId, { itemType, itemId, amount, currency: "USD", paymentMethod });
      const completed = await store.completePayment(payment.id, transactionId);

      if (itemType === "training") {
        try { await store.enrollInTraining(itemId, req.auth.userId); } catch { /* already enrolled */ }
      } else if (itemType === "group_join") {
        try { await store.joinGroup(itemId, req.auth.userId); } catch { /* already member */ }
      }

      try {
        await store.createNotification(req.auth.userId, {
          title: "Payment Successful",
          message: `Your payment of $${amount.toFixed(2)} has been processed successfully.`,
          type: "success",
        });
      } catch { /* non-critical */ }

      try {
        const payer = await store.findUserById(req.auth.userId);
        if (payer) await sendPaymentReceiptEmail(payer.email, payer.fullName, amount, itemType.replace(/_/g, " "));
      } catch { /* non-critical */ }

      res.status(201).json({ message: "Payment successful.", payment: completed });
    } catch (error) { next(error); }
  });

  // Stripe webhook
  router.post("/webhook", express.raw({ type: "application/json" }), async (req, res, next) => {
    if (!isStripeConfigured) return res.status(200).json({ received: true });

    try {
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(config.stripeSecretKey);
      const sig = req.headers["stripe-signature"];
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);
      } catch {
        return res.status(400).json({ message: "Webhook signature verification failed." });
      }

      if (event.type === "payment_intent.payment_failed") {
        const intent = event.data.object;
        const { userId, itemType, itemId } = intent.metadata || {};
        if (userId) {
          try {
            await store.createNotification(userId, {
              title: "Payment Failed",
              message: `Your payment for ${itemType || "item"} could not be processed. Please try again.`,
              type: "error",
            });
          } catch { /* non-critical */ }
        }
        console.warn(`[Stripe] Payment failed for intent ${intent.id} — user: ${userId}, item: ${itemType}/${itemId}`);
      }

      res.json({ received: true });
    } catch (error) { next(error); }
  });

  router.get("/", authenticate, async (req, res, next) => {
    try {
      const payments = await store.listPaymentsByUser(req.auth.userId);
      const { data, pagination } = paginate(payments, req.query);
      res.json({ payments: data, ...(pagination && { pagination }) });
    } catch (error) { next(error); }
  });

  router.get("/check", authenticate, async (req, res, next) => {
    try {
      const itemType = trimText(req.query.itemType);
      const itemId = trimText(req.query.itemId);
      if (!itemType || !itemId) return res.status(400).json({ message: "itemType and itemId required." });
      const paid = await store.hasActivePayment(req.auth.userId, itemType, itemId);
      res.json({ paid });
    } catch (error) { next(error); }
  });

  return router;
}

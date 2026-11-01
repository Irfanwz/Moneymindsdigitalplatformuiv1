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
      if (!training)
        throw Object.assign(new Error("Training not found."), { status: 404 });
      if (training.type !== "paid")
        throw Object.assign(new Error("This training is free."), {
          status: 400,
        });
      if (training.enrolled >= training.capacity)
        throw Object.assign(new Error("This training is full."), {
          status: 409,
        });
      return Number(training.price);
    }
    const group = await store.findGroupById(itemId);
    if (!group)
      throw Object.assign(new Error("Group not found."), { status: 404 });
    if (!group.isPaid)
      throw Object.assign(new Error("This group is free."), { status: 400 });
    return parseFloat(
      itemType === "group_join"
        ? group.joiningFee || "0"
        : group.monthlyFee || "0",
    );
  }

  async function savePayment(input) {
    const result = await store.recordCheckout(input);
    if (result.created) {
      try {
        await store.createNotification(input.userId, {
          title: "Payment Successful",
          message: `Your payment of $${Number(input.amount).toFixed(2)} has been recorded.`,
          type: "success",
        });
      } catch {
        /* Non-critical; payment and access are already committed. */
      }
      try {
        const payer = await store.findUserById(input.userId);
        if (payer)
          await sendPaymentReceiptEmail(
            payer.email,
            payer.fullName,
            Number(input.amount),
            input.itemType.replace(/_/g, " "),
          );
      } catch {
        /* Non-critical */
      }
    }
    return result.payment;
  }
  async function settleIntent(intent, expectedUserId) {
    const { userId, itemType, itemId, expectedAmount } = intent.metadata || {};
    if (
      intent.status !== "succeeded" ||
      !userId ||
      !["training", "group_join", "group_monthly"].includes(itemType) ||
      !itemId ||
      intent.currency !== "usd" ||
      !Number.isFinite(intent.amount_received) ||
      intent.amount_received <= 0 ||
      Number(expectedAmount) !== intent.amount_received ||
      (expectedUserId && userId !== expectedUserId)
    )
      throw Object.assign(
        new Error("The payment has not been confirmed for this purchase."),
        { status: 400 },
      );
    return savePayment({
      userId,
      itemType,
      itemId,
      amount: intent.amount_received / 100,
      currency: "USD",
      transactionRef: intent.id,
    });
  }

  // Stripe collects the card details on its hosted checkout, never in our form.
  router.post(
    "/checkout-session",
    authenticate,
    validate(createIntentSchema),
    async (req, res, next) => {
      try {
        const { itemType, itemId } = req.body;
        if (await store.hasActivePayment(req.auth.userId, itemType, itemId))
          return res
            .status(409)
            .json({
              message: "You already have a completed payment for this item.",
            });
        const amount = await resolveAmount(itemType, itemId);
        if (!Number.isFinite(amount) || amount <= 0)
          return res
            .status(400)
            .json({
              message: "This item does not have a valid payable amount.",
            });
        if (!isStripeConfigured) {
          if (config.nodeEnv === "production")
            return res
              .status(503)
              .json({
                message:
                  "Online payments are temporarily unavailable. Please contact support.",
              });
          return res.json({ simulated: true, amount, currency: "USD" });
        }
        const { default: Stripe } = await import("stripe");
        const stripe = new Stripe(config.stripeSecretKey);
        const item =
          itemType === "training"
            ? await store.findTrainingById(itemId)
            : await store.findGroupById(itemId);
        const cents = Math.round(amount * 100);
        const metadata = {
          source: "moneyminds",
          userId: req.auth.userId,
          itemType,
          itemId,
          expectedAmount: String(cents),
        };
        const origin = new URL(config.clientOrigin).origin;
        const session = await stripe.checkout.sessions.create(
          {
            mode: "payment",
            payment_method_types: ["card"],
            client_reference_id: req.auth.userId,
            customer_email: req.currentUser.email,
            line_items: [
              {
                quantity: 1,
                price_data: {
                  currency: "usd",
                  unit_amount: cents,
                  product_data: { name: item.title || item.name },
                },
              },
            ],
            metadata,
            payment_intent_data: { metadata },
            success_url: `${origin}/payments/complete?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/payments/complete?cancelled=1`,
          },
          {
            idempotencyKey: `purchase:${req.auth.userId}:${itemType}:${itemId}:${cents}:${new Date().toISOString().slice(0, 10)}`,
          },
        );
        res.json({ url: session.url, simulated: false });
      } catch (error) {
        next(error);
      }
    },
  );
  router.post(
    "/checkout-session/confirm",
    authenticate,
    async (req, res, next) => {
      try {
        if (!isStripeConfigured)
          return res
            .status(503)
            .json({ message: "The payment provider is not configured." });
        const sessionId = trimText(req.body?.sessionId);
        if (!/^cs_[a-zA-Z0-9_]+$/.test(sessionId))
          return res
            .status(400)
            .json({ message: "A valid checkout session is required." });
        const { default: Stripe } = await import("stripe");
        const stripe = new Stripe(config.stripeSecretKey);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.metadata?.userId !== req.auth.userId)
          return res
            .status(403)
            .json({ message: "This checkout belongs to another account." });
        if (session.payment_status !== "paid" || !session.payment_intent)
          return res
            .status(409)
            .json({
              message:
                "Payment is still pending. Refresh after the provider confirms it.",
            });
        const intent = await stripe.paymentIntents.retrieve(
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id,
        );
        res.json({ payment: await settleIntent(intent, req.auth.userId) });
      } catch (error) {
        next(error);
      }
    },
  );

  // Create Stripe PaymentIntent (or return simulated flag)
  router.post(
    "/create-intent",
    authenticate,
    validate(createIntentSchema),
    async (req, res, next) => {
      try {
        const itemType = trimText(req.body?.itemType);
        const itemId = trimText(req.body?.itemId);

        if (!["group_join", "group_monthly", "training"].includes(itemType)) {
          return res.status(400).json({ message: "Invalid payment type." });
        }
        if (!itemId)
          return res.status(400).json({ message: "Item ID is required." });

        const alreadyPaid = await store.hasActivePayment(
          req.auth.userId,
          itemType,
          itemId,
        );
        if (alreadyPaid)
          return res
            .status(400)
            .json({ message: "You have already paid for this item." });

        let amount;
        try {
          amount = await resolveAmount(itemType, itemId);
        } catch (err) {
          return res.status(err.status || 400).json({ message: err.message });
        }

        if (!Number.isFinite(amount) || amount <= 0)
          return res
            .status(400)
            .json({
              message: "This item does not have a valid payable amount.",
            });

        if (!isStripeConfigured) {
          if (config.nodeEnv === "production")
            return res
              .status(503)
              .json({
                message:
                  "Payments are unavailable until the payment provider is configured.",
              });
          return res.json({
            clientSecret: null,
            simulated: true,
            amount,
            currency: "usd",
            message: "Stripe not configured. Payment will be simulated.",
          });
        }

        const { default: Stripe } = await import("stripe");
        const stripe = new Stripe(config.stripeSecretKey);
        const intent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: "usd",
          metadata: {
            source: "moneyminds",
            userId: req.auth.userId,
            itemType,
            itemId,
            expectedAmount: String(Math.round(amount * 100)),
          },
        });

        res.json({
          clientSecret: intent.client_secret,
          amount,
          currency: "usd",
          simulated: false,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  // Complete payment after Stripe confirmation (or simulation)
  router.post(
    "/checkout",
    authenticate,
    validate(checkoutSchema),
    async (req, res, next) => {
      try {
        const itemType = trimText(req.body?.itemType);
        const itemId = trimText(req.body?.itemId);
        const paymentMethod = trimText(req.body?.paymentMethod) || "card";
        const stripePaymentIntentId = trimText(req.body?.stripePaymentIntentId);

        if (!["group_join", "group_monthly", "training"].includes(itemType)) {
          return res.status(400).json({ message: "Invalid payment type." });
        }
        if (!itemId)
          return res.status(400).json({ message: "Item ID is required." });

        const alreadyPaid = await store.hasActivePayment(
          req.auth.userId,
          itemType,
          itemId,
        );
        if (alreadyPaid)
          return res
            .status(400)
            .json({ message: "You have already paid for this item." });

        let amount;
        try {
          amount = await resolveAmount(itemType, itemId);
        } catch (err) {
          return res.status(err.status || 400).json({ message: err.message });
        }

        if (!Number.isFinite(amount) || amount <= 0)
          return res
            .status(400)
            .json({
              message: "This item does not have a valid payable amount.",
            });

        let transactionId;
        if (isStripeConfigured) {
          if (!stripePaymentIntentId)
            return res
              .status(400)
              .json({
                message: "A confirmed payment provider reference is required.",
              });
          const { default: Stripe } = await import("stripe");
          const stripe = new Stripe(config.stripeSecretKey);
          const intent = await stripe.paymentIntents.retrieve(
            stripePaymentIntentId,
          );
          if (intent.status !== "succeeded")
            return res
              .status(400)
              .json({ message: "Payment has not been completed." });
          if (
            intent.metadata?.userId !== req.auth.userId ||
            intent.metadata?.itemType !== itemType ||
            intent.metadata?.itemId !== itemId ||
            intent.currency !== "usd" ||
            intent.amount_received !== Math.round(amount * 100)
          )
            return res
              .status(400)
              .json({
                message:
                  "The payment does not match this account, item and amount.",
              });
          transactionId = intent.id;
        } else {
          if (config.nodeEnv === "production")
            return res
              .status(503)
              .json({
                message:
                  "Payments are unavailable until the payment provider is configured.",
              });
          transactionId = `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        }

        const completed = await savePayment({
          userId: req.auth.userId,
          itemType,
          itemId,
          amount,
          currency: "USD",
          transactionRef: transactionId,
        });

        res
          .status(201)
          .json({ message: "Payment successful.", payment: completed });
      } catch (error) {
        next(error);
      }
    },
  );

  // Stripe webhook
  router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    async (req, res, next) => {
      if (!isStripeConfigured) return res.status(200).json({ received: true });

      try {
        const { default: Stripe } = await import("stripe");
        const stripe = new Stripe(config.stripeSecretKey);
        const sig = req.headers["stripe-signature"];
        let event;

        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            config.stripeWebhookSecret,
          );
        } catch {
          return res
            .status(400)
            .json({ message: "Webhook signature verification failed." });
        }

        if (
          [
            "checkout.session.completed",
            "checkout.session.async_payment_succeeded",
          ].includes(event.type)
        ) {
          const session = event.data.object;
          if (
            session.metadata?.source === "moneyminds" &&
            session.payment_status === "paid" &&
            session.payment_intent
          ) {
            const intent = await stripe.paymentIntents.retrieve(
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent.id,
            );
            await settleIntent(intent);
          }
        } else if (
          event.type === "payment_intent.succeeded" &&
          event.data.object.metadata?.source === "moneyminds"
        ) {
          await settleIntent(event.data.object);
        }

        if (event.type === "payment_intent.payment_failed") {
          const intent = event.data.object;
          const { userId, itemType, itemId } = intent.metadata || {};
          if (userId) {
            try {
              await store.createNotification(userId, {
                title: "Payment Failed",
                message: `Your payment for ${itemType || "item"} could not be processed. Please try again.`,
                type: "warning",
              });
            } catch {
              /* non-critical */
            }
          }
          console.warn(
            `[Stripe] Payment failed for intent ${intent.id} — user: ${userId}, item: ${itemType}/${itemId}`,
          );
        }

        res.json({ received: true });
      } catch (error) {
        next(error);
      }
    },
  );

  router.get("/", authenticate, async (req, res, next) => {
    try {
      const payments = await store.listPaymentsByUser(req.auth.userId);
      const { data, pagination } = paginate(payments, req.query);
      res.json({ payments: data, ...(pagination && { pagination }) });
    } catch (error) {
      next(error);
    }
  });

  router.get("/check", authenticate, async (req, res, next) => {
    try {
      const itemType = trimText(req.query.itemType);
      const itemId = trimText(req.query.itemId);
      if (!itemType || !itemId)
        return res
          .status(400)
          .json({ message: "itemType and itemId required." });
      const paid = await store.hasActivePayment(
        req.auth.userId,
        itemType,
        itemId,
      );
      res.json({ paid });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

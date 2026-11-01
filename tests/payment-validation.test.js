import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import RealStripe from "stripe";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { createApp } from "../server/app.js";
import { createToken } from "../server/auth.js";
import { config } from "../server/config.js";
const { retrieve, createSession, retrieveSession } = vi.hoisted(() => ({
  retrieve: vi.fn(),
  createSession: vi.fn(),
  retrieveSession: vi.fn(),
}));
vi.mock("../server/config.js", async (original) => ({
  ...(await original()),
  isStripeConfigured: true,
}));
vi.mock("stripe", async (original) => {
  const { default: Stripe } = await original();
  return {
    default: class extends Stripe {
      constructor(...args) {
        super(...args);
        this.paymentIntents.retrieve = retrieve;
        this.checkout.sessions.create = createSession;
        this.checkout.sessions.retrieve = retrieveSession;
      }
    },
  };
});
vi.mock("../server/email.js", () => ({
  sendWelcomeEmail: vi.fn(),
  sendApprovalEmail: vi.fn(),
  sendRejectionEmail: vi.fn(),
  sendPaymentReceiptEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));
let app, store, user, training, intent;
beforeEach(async () => {
  config.stripeSecretKey = "sk_test_fixture_only";
  config.stripeWebhookSecret = "whsec_fixture_only";
  store = createMemoryStore();
  user = await store.ensureAdminAccount({
    fullName: "Fixture",
    email: "payments@example.test",
    passwordHash: "unused",
  });
  training = await store.createTraining(user.id, {
    title: "Paid fixture",
    type: "paid",
    price: 25,
    topics: [],
    targetAudience: [],
    capacity: 10,
    enrolled: 0,
  });
  intent = {
    id: "pi_fixture",
    status: "succeeded",
    currency: "usd",
    amount_received: 2500,
    metadata: {
      source: "moneyminds",
      userId: user.id,
      itemType: "training",
      itemId: training.id,
      expectedAmount: "2500",
    },
  };
  createSession.mockReset();
  retrieveSession.mockReset();
  createSession.mockResolvedValue({
    id: "cs_fixture",
    url: "https://checkout.stripe.com/c/pay/cs_fixture",
  });
  retrieveSession.mockResolvedValue({
    id: "cs_fixture",
    payment_status: "paid",
    payment_intent: "pi_fixture",
    metadata: { ...intent.metadata },
  });
  retrieve.mockImplementation(async () => intent);
  app = createApp(store, { backgroundJobs: false });
});
const checkout = (reference = "pi_fixture") =>
  request(app)
    .post("/api/payments/checkout")
    .set({ Cookie: `mm_token=${createToken(user)}` })
    .send({
      itemType: "training",
      itemId: training.id,
      stripePaymentIntentId: reference,
    });
describe("Payment provider validation", () => {
  it("creates hosted checkout using server prices and bound account metadata", async () => {
    const res = await request(app)
      .post("/api/payments/checkout-session")
      .set({ Cookie: `mm_token=${createToken(user)}` })
      .send({ itemType: "training", itemId: training.id, amount: 1 })
      .expect(200);
    expect(res.body.url).toMatch(/^https:\/\/checkout.stripe.com\//);
    const [payload, options] = createSession.mock.calls[0];
    expect(payload.line_items[0].price_data.unit_amount).toBe(2500);
    expect(payload.metadata.userId).toBe(user.id);
    expect(payload.payment_intent_data.metadata.expectedAmount).toBe("2500");
    expect(payload.success_url).toContain(
      "/payments/complete?session_id={CHECKOUT_SESSION_ID}",
    );
    expect(options.idempotencyKey).toContain(user.id);
  });
  it("does not confirm another account session or a pending payment", async () => {
    const confirm = () =>
      request(app)
        .post("/api/payments/checkout-session/confirm")
        .set({ Cookie: `mm_token=${createToken(user)}` })
        .send({ sessionId: "cs_fixture" });
    retrieveSession.mockResolvedValueOnce({
      metadata: { userId: "another-user" },
      payment_status: "paid",
      payment_intent: "pi_fixture",
    });
    await confirm().expect(403);
    retrieveSession.mockResolvedValueOnce({
      metadata: { userId: user.id },
      payment_status: "unpaid",
      payment_intent: "pi_fixture",
    });
    await confirm().expect(409);
    expect(await store.listAdminPayments()).toHaveLength(0);
  });
  it("fulfills a hosted payment once when the browser and webhook retry concurrently", async () => {
    const payload = JSON.stringify({
      id: "evt_paid",
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { ...intent.metadata },
          payment_status: "paid",
          payment_intent: "pi_fixture",
        },
      },
    });
    const stripe = new RealStripe(config.stripeSecretKey);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: config.stripeWebhookSecret,
    });
    const webhook = () =>
      request(app)
        .post("/api/payments/webhook")
        .set("Content-Type", "application/json")
        .set("stripe-signature", signature)
        .send(payload)
        .expect(200);
    await Promise.all([
      webhook(),
      webhook(),
      request(app)
        .post("/api/payments/checkout-session/confirm")
        .set({ Cookie: `mm_token=${createToken(user)}` })
        .send({ sessionId: "cs_fixture" })
        .expect(200),
    ]);
    expect(await store.listAdminPayments()).toHaveLength(1);
    expect(await store.listEnrollmentsByUser(user.id)).toHaveLength(1);
    expect((await store.findTrainingById(training.id)).enrolled).toBe(1);
    expect(await store.listNotificationsByUser(user.id)).toHaveLength(1);
  });
  it("requires a provider reference when Stripe is configured", async () => {
    await checkout("").expect(400);
    expect(await store.listAdminPayments()).toEqual([]);
  });
  it.each(["owner", "item", "currency", "amount", "status"])(
    "rejects a mismatched %s without recording a payment",
    async (field) => {
      if (field === "owner") intent.metadata.userId = "another-user";
      if (field === "item") intent.metadata.itemId = "another-item";
      if (field === "currency") intent.currency = "eur";
      if (field === "amount") intent.amount_received = 1;
      if (field === "status") intent.status = "requires_payment_method";
      await checkout().expect(400);
      expect(await store.listAdminPayments()).toEqual([]);
    },
  );
  it("records a matching payment and grants enrollment once", async () => {
    await checkout().expect(201);
    await checkout().expect(400);
    expect(await store.listAdminPayments()).toHaveLength(1);
    expect(await store.listEnrollmentsByUser(user.id)).toHaveLength(1);
  });
  it("verifies Stripe webhooks against the original raw bytes", async () => {
    const payload = JSON.stringify({
      id: "evt_fixture",
      type: "payment_intent.payment_failed",
      data: {
        object: {
          id: "pi_failed",
          metadata: {
            userId: user.id,
            itemType: "training",
            itemId: training.id,
          },
        },
      },
    });
    const stripe = new RealStripe(config.stripeSecretKey);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: config.stripeWebhookSecret,
    });
    await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", signature)
      .send(payload)
      .expect(200);
    expect((await store.listNotificationsByUser(user.id))[0].type).toBe(
      "warning",
    );
    await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "invalid")
      .send(payload)
      .expect(400);
  });
});

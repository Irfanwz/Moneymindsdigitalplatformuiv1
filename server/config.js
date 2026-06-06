import dotenv from "dotenv";

dotenv.config();

function toNumber(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  apiPort: toNumber(process.env.API_PORT, 3001),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://127.0.0.1:5173",
  jwtSecret: process.env.JWT_SECRET ?? "moneyminds-dev-secret",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@moneyminds.local",
  adminPassword: process.env.ADMIN_PASSWORD ?? "Admin123!",
  adminName: process.env.ADMIN_NAME ?? "Platform Admin",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  sendgridApiKey: process.env.SENDGRID_API_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
};

export const isSupabaseConfigured =
  config.supabaseUrl.length > 0 && config.supabaseServiceRoleKey.length > 0;

export const isEmailConfigured = config.sendgridApiKey.length > 0;

export const isStripeConfigured =
  config.stripeSecretKey.length > 0 && config.stripeWebhookSecret.length > 0;

// In production, fail fast if critical env vars are missing
if (config.nodeEnv === "production") {
  const required = [
    ["JWT_SECRET", config.jwtSecret === "moneyminds-dev-secret" ? "" : config.jwtSecret],
    ["CLIENT_ORIGIN", process.env.CLIENT_ORIGIN],
    ["ADMIN_EMAIL", process.env.ADMIN_EMAIL],
    ["ADMIN_PASSWORD", process.env.ADMIN_PASSWORD],
  ];

  const missing = required.filter(([, value]) => !value).map(([key]) => key);

  if (missing.length > 0) {
    console.error(`[STARTUP ERROR] Missing required environment variables:\n  ${missing.join("\n  ")}`);
    process.exit(1);
  }

  if (!isSupabaseConfigured) {
    console.warn("[STARTUP WARN] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — running in memory mode.");
  }

  if (!isEmailConfigured) {
    console.warn("[STARTUP WARN] SENDGRID_API_KEY not set — emails will not be sent.");
  }

  if (!isStripeConfigured) {
    console.warn("[STARTUP WARN] STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET not set — payments will be simulated.");
  }
}

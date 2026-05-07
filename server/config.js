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
};

export const isSupabaseConfigured =
  config.supabaseUrl.length > 0 && config.supabaseServiceRoleKey.length > 0;

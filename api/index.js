import { hashPassword } from "../server/auth.js";
import { createApp } from "../server/app.js";
import { config } from "../server/config.js";
import { store } from "../server/store/index.js";
import { seedDemoProfiles } from "../server/seed.js";

// Runs once per cold start, idempotent with Supabase
const initPromise = (async () => {
  const passwordHash = await hashPassword(config.adminPassword);

  await store.ensureAdminAccount({
    fullName: config.adminName,
    email: config.adminEmail,
    passwordHash,
  });

  console.log("Seeding demo profiles...");
  await seedDemoProfiles(store);
  console.log("Bootstrap complete");
})();

const app = createApp(store);

export default async function handler(req, res) {
  await initPromise;
  return app(req, res);
}

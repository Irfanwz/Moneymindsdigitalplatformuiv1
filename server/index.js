import { shouldSeedDemoProfiles } from "./bootstrapPolicy.js";
import { hashPassword } from "./auth.js";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { store } from "./store/index.js";
import { createMemoryStore } from "./store/memoryStore.js";
import { seedDemoProfiles } from "./seed.js";
import { runMigrations } from "./migrations/runner.js";

async function bootstrap() {
  // Finish schema upgrades before admin/bootstrap writes, HTTP requests or jobs.
  await runMigrations();
  const passwordHash = await hashPassword(config.adminPassword);

  let activeStore = store;
  try {
    await activeStore.ensureAdminAccount({
      fullName: config.adminName,
      email: config.adminEmail,
      passwordHash,
    });
  } catch (error) {
    if (config.nodeEnv === "development" && activeStore.mode === "supabase") {
      console.warn(
        `\n⚠️  [WARN] Failed to connect to Supabase at ${config.supabaseUrl} (${error.message}).`
      );
      console.warn(
        `⚠️  Falling back to in-memory storage so the server can run locally.\n`
      );
      activeStore = createMemoryStore();
      await activeStore.ensureAdminAccount({
        fullName: config.adminName,
        email: config.adminEmail,
        passwordHash,
      });
    } else {
      throw error;
    }
  }

  if (shouldSeedDemoProfiles(config.nodeEnv, process.env.SEED_DEMO_PROFILES) || activeStore.mode === "memory") {
    console.log("Seeding development demo profiles...");
    await seedDemoProfiles(activeStore);
  }

  const app = createApp(activeStore);

  app.listen(config.apiPort, () => {
    console.log(
      `MoneyMinds API listening on http://127.0.0.1:${config.apiPort} using ${activeStore.mode} storage`,
    );
    console.log(`Bootstrap admin: ${config.adminEmail}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start MoneyMinds API", error);
  process.exitCode = 1;
});

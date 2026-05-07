import { hashPassword } from "./auth.js";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { store } from "./store/index.js";
import { seedDemoProfiles } from "./seed.js";

async function bootstrap() {
  const passwordHash = await hashPassword(config.adminPassword);

  await store.ensureAdminAccount({
    fullName: config.adminName,
    email: config.adminEmail,
    passwordHash,
  });

  console.log("Seeding demo profiles...");
  await seedDemoProfiles(store);

  const app = createApp(store);

  app.listen(config.apiPort, () => {
    console.log(
      `MoneyMinds API listening on http://127.0.0.1:${config.apiPort} using ${store.mode} storage`,
    );
    console.log(`Bootstrap admin: ${config.adminEmail}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start MoneyMinds API", error);
  process.exitCode = 1;
});

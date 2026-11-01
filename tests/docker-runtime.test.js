import { it, expect } from "vitest";
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

it("loads the server and migrations from the files included in the Docker runtime", async () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const directory = await mkdtemp(join(tmpdir(), "moneyminds-runtime-"));
  try {
    const dockerfile = await readFile(join(root, "Dockerfile"), "utf8");
    const runtimeStage = dockerfile.split("# Stage 2: Production")[1];
    expect(runtimeStage).toBeTruthy();
    // Follow the actual runtime COPY instructions. Builder artifacts (dist) are
    // unrelated to module resolution and checked by the separate Vite build.
    for (const line of runtimeStage.split(/\r?\n/)) {
      if (!line.startsWith("COPY ") || line.startsWith("COPY --from=")) continue;
      const paths = line.split(/\s+/).slice(1);
      const destination = paths.pop();
      for (const source of paths) {
        const target = source.endsWith("/") || !destination.endsWith("/") ? destination : join(destination, source.split("/").at(-1));
        await cp(join(root, source), join(directory, target), { recursive: true });
      }
    }
    await symlink(join(root, "node_modules"), join(directory, "node_modules"), process.platform === "win32" ? "junction" : "dir");
    const env = { ...process.env, NODE_ENV: "test", AUTO_MIGRATE: "false" };
    for (const name of Object.keys(env)) if (/SUPABASE|API_KEY|SECRET|STRIPE|DATABASE_URL/.test(name)) delete env[name];
    await writeFile(join(directory, "runtime-check.mjs"), `
      import { createApp } from './server/app.js';
      import { loadMigrations } from './server/migrations/runner.js';
      if (typeof createApp !== 'function') throw new Error('Server module missing');
      const migrations = await loadMigrations();
      console.log('runtime-ready:' + migrations.length);
    `);
    const { stdout } = await promisify(execFile)(process.execPath, ["runtime-check.mjs"], { cwd: directory, env, timeout: 30_000 });
    expect(stdout).toContain("runtime-ready:3");
    // Startup must stop before seeding or listening if automatic mode cannot run.
    await expect(promisify(execFile)(process.execPath, ["server/index.js"], {
      cwd: directory, env: { ...env, AUTO_MIGRATE: "true" }, timeout: 15_000,
    })).rejects.toMatchObject({ code: 1, stderr: expect.stringContaining("Automatic migrations require SUPABASE_SERVICE_ROLE_KEY") });
  } finally {
    // Only remove this test's exact mkdtemp directory; never follow the junction.
    if (dirname(resolve(directory)) !== resolve(tmpdir()) || !directory.includes("moneyminds-runtime-")) throw new Error("Unexpected fixture cleanup path");
    await rm(join(directory, "node_modules"), { force: true, recursive: true });
    await rm(directory, { recursive: true, force: true });
  }
}, 45_000);

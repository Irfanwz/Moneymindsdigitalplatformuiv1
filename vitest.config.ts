import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, defineConfig({
  test: {
    // Existing route fixtures sign in with passwords. OTP integration tests
    // explicitly enable the separate email challenge. Production is unchanged.
    env: { EMAIL_OTP_ENABLED: "false" },
  },
}));

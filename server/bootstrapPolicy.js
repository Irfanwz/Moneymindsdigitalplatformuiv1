export function shouldSeedDemoProfiles(nodeEnv, enabled) {
  return nodeEnv !== "production" && enabled === "true";
}

export function productionConfigurationErrors(config) {
  if (config.nodeEnv !== "production") return [];
  const errors = [];
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) errors.push("Production requires persistent storage: configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  if (!config.jwtSecret || config.jwtSecret.length < 32 || config.jwtSecret === "moneyminds-dev-secret") errors.push("JWT_SECRET must contain at least 32 characters in production.");
  if (!config.adminPassword || config.adminPassword.length < 12) errors.push("ADMIN_PASSWORD must contain at least 12 characters in production.");
  return errors;
}

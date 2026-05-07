import { config, isSupabaseConfigured } from "../config.js";
import { createMemoryStore } from "./memoryStore.js";
import { createSupabaseStore } from "./supabaseStore.js";

export const store = isSupabaseConfigured
  ? createSupabaseStore({
      supabaseUrl: config.supabaseUrl,
      supabaseServiceRoleKey: config.supabaseServiceRoleKey,
    })
  : createMemoryStore();

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Browser client for Lovable Cloud backend.
 *
 * Why this exists:
 * - The generated client relies strictly on import-time env injection.
 * - In some environments, values can be missing or wrapped in quotes, causing
 *   `Error: supabaseUrl is required.` at runtime.
 *
 * This wrapper:
 * - Sanitizes env values (trims and removes surrounding quotes)
 * - Provides a safe fallback to the current project’s public URL + anon key
 */
const sanitizeEnv = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim().replace(/^['"]|['"]$/g, "");
};

const FALLBACK_SUPABASE_URL = "https://rdzwqkklwyuonjqwiczh.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkendxa2tsd3l1b25qcXdpY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjYzODYsImV4cCI6MjA4MTc0MjM4Nn0.JDce-OYSnC2xo02fEDDf_hnR-HKY815CuTn5XUSOPY8";

const SUPABASE_URL =
  sanitizeEnv(import.meta.env.VITE_SUPABASE_URL) || FALLBACK_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY =
  sanitizeEnv(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  FALLBACK_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);

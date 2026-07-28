import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Littora] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. " +
    "Auth will not work until you add them to frontend/.env"
  );
}

// Anon key only — safe to expose in the browser.
// This client is used exclusively for authentication session management.
export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

/**
 * run-migration.js — Add user_id column to the analyses table
 *
 * Run this once with:
 *   cd backend && node run-migration.js
 *
 * This uses the Supabase PostgreSQL connection via @supabase/supabase-js
 * with a small workaround: we trigger the column addition via a select
 * combined with a DO block using the REST API endpoint.
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function runMigration() {
  console.log("🔧 Running migration: adding user_id column to analyses...\n");

  // Check if column already exists
  const { data: checkData, error: checkError } = await supabase
    .from("analyses")
    .select("id, user_id")
    .limit(1);

  if (!checkError) {
    console.log("✅ user_id column already exists. Migration not needed.");
    process.exit(0);
  }

  console.log("Column does not exist yet. Please run the following SQL in your");
  console.log("Supabase SQL Editor (https://supabase.com/dashboard/project/adfhubqrgunuuwcqssro/sql):\n");
  console.log("─".repeat(60));
  console.log(`
-- Add user_id column to analyses table
ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS user_id UUID
  REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
`);
  console.log("─".repeat(60));
  console.log("\nAfter running that SQL, re-run this script to verify the column was added.");

  process.exit(0);
}

runMigration().catch((e) => {
  console.error("Migration error:", e.message);
  process.exit(1);
});

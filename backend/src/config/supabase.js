const { createClient } = require("@supabase/supabase-js");

const supabaseUrl =
  process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "placeholder-key";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key";

// Warn if using placeholder values
if (supabaseUrl.includes("placeholder")) {
  console.warn(
    "⚠️  Warning: Using placeholder Supabase credentials. Please update .env file with real credentials."
  );
}

// Client for regular operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for privileged operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase, supabaseAdmin };

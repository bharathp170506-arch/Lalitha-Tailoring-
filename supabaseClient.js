// lib/supabaseClient.js
//
// Single shared Supabase client for the whole app.
// Reads config from env vars — see README.md for where to set these
// (both locally in .env.local and in Netlify's dashboard).
//
// NOTE: this uses the public "anon" key, which is safe to expose in the
// browser as long as Row Level Security (RLS) policies are set up
// correctly (see sql/schema.sql). Never put the service_role key in
// frontend code.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev rather than silently returning null data everywhere
  console.warn(
    "Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

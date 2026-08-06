// lib/supabaseAdmin.js
// Server-side Supabase client using the SERVICE ROLE key.
//
// This key bypasses Row Level Security, which the send-otp/verify-otp API
// routes need (they must read/write `profiles` before the user is
// authenticated). NEVER expose this key to the frontend — it only belongs
// in Vercel's server-side environment variables, never in a VITE_ var.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

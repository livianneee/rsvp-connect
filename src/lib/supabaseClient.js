// -----------------------------------------------------------------------------
// Supabase client
// -----------------------------------------------------------------------------
// Reads credentials from environment variables (set them in a local .env file
// and in your Vercel project settings). If either is missing, the app quietly
// falls back to browser (localStorage) mode — see dataSource.js.
//
//   VITE_SUPABASE_URL       e.g. https://abcdefgh.supabase.co
//   VITE_SUPABASE_ANON_KEY  the "anon / public" key (safe to expose IF your RLS
//                           policies are set up correctly — see README)
// -----------------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabase = Boolean(url && anonKey)

export const supabase = hasSupabase ? createClient(url, anonKey) : null

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient<any> | null = null;

function resolveSupabaseUrl(url: string) {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

export function getSupabaseClient() {
  if (client) return client;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase env vars");
  }
  client = createClient<any>(resolveSupabaseUrl(supabaseUrl), supabaseAnonKey);
  return client;
}

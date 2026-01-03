import { createBrowserClient } from '@supabase/ssr';

// Create an untyped client to avoid Supabase's strict type inference issues
// This is necessary because Supabase's generated types cause 'never' type errors
// when the database schema doesn't perfectly match the TypeScript types
export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton instance for client-side usage
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}

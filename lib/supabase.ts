import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Typed client for read operations with full type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Untyped client for write operations to avoid Supabase type inference issues
// This is a workaround for Supabase's strict type checking that causes 'never' type errors
export const supabaseUntyped: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export type { Database };

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase URL and Anon Key from environment variables
// Support both Expo (EXPO_PUBLIC_) and Next.js (NEXT_PUBLIC_) prefixes
function getSupabaseUrl(): string {
  const url =
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL;

  if (!url) {
    throw new Error(
      'Missing Supabase URL. Set EXPO_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_URL'
    );
  }

  return url;
}

function getSupabaseAnonKey(): string {
  const key =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      'Missing Supabase Anon Key. Set EXPO_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY, or SUPABASE_ANON_KEY'
    );
  }

  return key;
}

// Create the Supabase client
// Note: For patient devices using Care Code JWT, a custom client will be created
// with the JWT token in the authorization header
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
  return supabaseInstance;
}

// Export a default instance for convenience
export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Create a client with a custom JWT (for patient devices using Care Code)
export function createPatientClient(jwtToken: string): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Export types for database operations
export type { SupabaseClient };

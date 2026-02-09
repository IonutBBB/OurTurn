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

// Simple in-memory storage fallback for environments where localStorage isn't available
const memoryStorage: Record<string, string> = {};

// Custom storage adapter that works in all environments
const customStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return memoryStorage[key] || null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    } else {
      memoryStorage[key] = value;
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    } else {
      delete memoryStorage[key];
    }
  },
};

// Active client — starts as the default anon client, but can be swapped
// to a patient JWT client via setPatientToken()
let _activeClient: SupabaseClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: customStorage,
  },
});

// Proxy so all imports of `supabase` automatically delegate to the current
// _activeClient. When setPatientToken() swaps the underlying client, every
// query file that imported `supabase` sees the new client instantly.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const value = (_activeClient as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(_activeClient);
    }
    return value;
  },
});

/**
 * Replace the active Supabase client with one that sends a patient JWT
 * in the Authorization header. All queries that import `supabase` will
 * automatically use this client.
 */
export function setPatientToken(jwtToken: string): void {
  _activeClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      params: {
        apikey: getSupabaseAnonKey(),
      },
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        apikey: getSupabaseAnonKey(),
      },
    },
  });
}

/**
 * Reset back to the default anon client (used on logout).
 */
export function clearPatientToken(): void {
  _activeClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: customStorage,
    },
  });
}

// Legacy helper — returns the active client
export function getSupabaseClient(): SupabaseClient {
  return supabase;
}

// Create a standalone client with a custom JWT (for one-off usage)
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

// Re-export Supabase client utilities
// NOTE: Only export browser client here to avoid bundling server-only code
// Server components should import directly: import { createClient } from '@/lib/supabase/server'
export { createClient as createBrowserClient } from './client';

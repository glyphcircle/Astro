import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://huvblygddkflciwfnbcf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1dmJseWdkZGtmbGNpd2ZuYmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzI5NjgsImV4cCI6MjA4NDE0ODk2OH0.gtNftIJUHNuWUriF7AJvat0SLUQLcsdpWVl-yGkv5m8';

export const isSupabaseConfigured = () => true;

// ✅ GLOBAL SINGLETON - Prevent any duplicate creation
if (!(window as any).__SUPABASE_CLIENT__) {
    console.log('🔌 [Supabase] Creating GLOBAL singleton...');

    (window as any).__SUPABASE_CLIENT__ = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'implicit' as const,
            storage: window.localStorage,
            storageKey: 'vedic-astro-auth-v2', // ✅ NEW storage key to avoid conflicts
            // Fixed: Removed 'lock: false' because boolean is not assignable to type LockFunc.
            // Supabase Auth handles tab-locking internally via the Navigator Lock API by default.
        },
        global: {
            headers: {
                'x-client-info': 'vedic-astro@1.0',
            },
        },
    });

    console.log('✅ [Supabase] GLOBAL singleton created');
} else {
    console.log('♻️ [Supabase] Reusing GLOBAL singleton');
}

// Export from window to ensure same instance everywhere
export const supabase = (window as any).__SUPABASE_CLIENT__ as SupabaseClient;

import { createClient } from '@supabase/supabase-js';

const resolveEnv = (key: string, fallback: string): string => {
    try {
        // Defensive check for Vite-style environment variables
        const meta = typeof import.meta !== 'undefined' ? import.meta : null;
        const env = meta && (meta as any).env ? (meta as any).env : null;
        if (env && env[key]) {
            return env[key];
        }

        // Defensive check for Node-style environment variables
        const proc = typeof process !== 'undefined' ? process : null;
        const pEnv = proc && proc.env ? proc.env : null;
        if (pEnv && (pEnv as any)[key]) {
            return (pEnv as any)[key];
        }
    } catch (e) {
        // Fallback on any error during resolution
    }
    return fallback;
};

const SUPABASE_URL = resolveEnv('VITE_SUPABASE_URL', 'https://huvblygddkflciwfnbcf.supabase.co');
const SUPABASE_ANON_KEY = resolveEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1dmJseWdkZGtmbGNpd2ZuYmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzI5NjgsImV4cCI6MjA4NDE0ODk2OH0.gtNftIJUHNuWUriF7AJvat0SLUQLcsdpWVl-yGkv5m8');

export const isSupabaseConfigured = () => {
    try {
        const url = new URL(SUPABASE_URL);
        return url.protocol === 'https:' && SUPABASE_ANON_KEY.length > 20;
    } catch {
        return false;
    }
};

// ✅ CUSTOM FETCH that logs and times out properly
const customFetch: typeof fetch = async (input, init) => {
    const requestUrl = typeof input === 'string' ? input : (input instanceof URL ? input.href : (input as Request).url);
    console.log('🌐 [FETCH] Request:', requestUrl, init?.method || 'GET');

    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => {
        console.warn('⏱️ [FETCH] TIMEOUT after 15 seconds!');
        controller.abort(new DOMException('The operation was aborted due to a 15s timeout.', 'AbortError'));
    }, 15000);

    try {
        const response = await fetch(input, {
            ...init,
            signal
        });

        clearTimeout(timeoutId);
        console.log('📥 [FETCH] Response:', response.status, response.statusText);
        return response;

    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error('⏱️ [FETCH] Request was aborted (timeout or cancel)');
        } else {
            console.error('💥 [FETCH] Error:', error);
        }
        throw error;
    }
};

// Create client with custom fetch and no lock
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
        fetch: customFetch
    },
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'implicit' as const,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
            console.log('🔓 [LOCK] Bypassed');
            return await fn();
        }
    }
});

// Auth state logger
supabase.auth.onAuthStateChange((event, _session) => {
    console.log(`🔌 [Auth] Dimension Shift Detected: ${event}`);
});

export default supabase;

// Debug exposure
if (typeof window !== 'undefined') {
    (window as any).supabase = supabase;
    console.log('🔧 [DEBUG] Supabase exposed to window.supabase');
}

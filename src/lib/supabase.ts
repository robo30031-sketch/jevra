import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable defaults
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Local storage overrides if entered via in-app settings
const STORAGE_URL_KEY = 'jevra_supabase_url';
const STORAGE_ANON_KEY = 'jevra_supabase_anon_key';

export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const url = localStorage.getItem(STORAGE_URL_KEY) || ENV_SUPABASE_URL;
  const anonKey = localStorage.getItem(STORAGE_ANON_KEY) || ENV_SUPABASE_ANON_KEY;
  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('your-project') &&
    !anonKey.includes('your-anon-key')
  );
  return { url, anonKey, isConfigured };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_URL_KEY, url.trim());
  localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
  // Re-create client
  clientInstance = null;
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_ANON_KEY);
  clientInstance = null;
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!clientInstance) {
    try {
      clientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return clientInstance;
}

/**
 * Perform a live ping / connection test to Supabase
 */
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{
  success: boolean;
  latencyMs?: number;
  message: string;
  error?: string;
}> {
  const url = customUrl || getSupabaseConfig().url;
  const key = customKey || getSupabaseConfig().anonKey;

  if (!url || !key || url.includes('your-project')) {
    return {
      success: false,
      message: 'Supabase credentials not configured yet. Provide Project URL and Anon Key.',
    };
  }

  const start = performance.now();
  try {
    const testClient = createClient(url, key);
    // Ping public endpoint or auth health check
    const { error } = await testClient.from('profiles').select('count', { count: 'exact', head: true });
    const latency = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116' && !error.message.includes('permission denied')) {
      // Note: If table does not exist or network fails
      if (error.code === '42P01') {
        return {
          success: true,
          latencyMs: latency,
          message: 'Connected to Supabase! (Database tables pending migration execution)',
        };
      }
      return {
        success: false,
        latencyMs: latency,
        message: `Connection attempt returned error: ${error.message}`,
        error: error.message,
      };
    }

    return {
      success: true,
      latencyMs: latency,
      message: `Successfully connected to Supabase PostgreSQL in ${latency}ms!`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Network error reaching Supabase endpoint: ${errorMsg}`,
      error: errorMsg,
    };
  }
}

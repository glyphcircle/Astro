import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { dbService } from '../services/db';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

// Verify Supabase client loaded
if (!supabase) {
  console.error('💥 FATAL: Supabase client failed to import!');
  throw new Error('Supabase client is undefined. Check import path.');
}
console.log('✅ Supabase client loaded successfully');

export interface NetworkEvent {
  id: string;
  endpoint: string;
  method: string;
  source: string;
  status: 'success' | 'pending' | 'error';
}

interface DbContextType {
  db: Record<string, any[]>;
  refreshTable: (tableName: string) => Promise<void>;
  updateEntry: (tableName: string, id: string | number, updates: any) => Promise<any>;
  createEntry: (tableName: string, payload: any) => Promise<any>;
  deleteEntry: (tableName: string, id: string | number) => Promise<void>;
  toggleStatus: (tableName: string, id: string | number) => Promise<void>;
  refresh: () => Promise<void>;
  networkLedger: NetworkEvent[];
}

export const DbContext = createContext<DbContextType | undefined>(undefined);

// Helper for safe environment access
const resolveEnv = (key: string, fallback: string): string => {
    try {
        const meta = typeof import.meta !== 'undefined' ? import.meta : null;
        const env = meta && (meta as any).env ? (meta as any).env : null;
        if (env && env[key]) {
            return env[key];
        }

        const proc = typeof process !== 'undefined' ? process : null;
        const pEnv = proc && proc.env ? proc.env : null;
        if (pEnv && (pEnv as any)[key]) {
            return (pEnv as any)[key];
        }
    } catch (e) {
        // Silently fail to fallback
    }
    return fallback;
};

export const DbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<Record<string, any[]>>({ services: [] });
  const [networkLedger, setNetworkLedger] = useState<NetworkEvent[]>([]);

  // Supabase configuration - use env vars with fallback
  const SUPABASE_URL = resolveEnv('VITE_SUPABASE_URL', 'https://huvblygddkflciwfnbcf.supabase.co');
  const SUPABASE_ANON_KEY = resolveEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1dmJseWdkZGtmbGNpd2ZuYmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzI5NjgsImV4cCI6MjA4NDE0ODk2OH0.gtNftIJUHNuWUriF7AJvat0SLUQLcsdpWVl-yGkv5m8');

  // Network event logger
  const logEvent = useCallback((event: Omit<NetworkEvent, 'id'>) => {
    setNetworkLedger(prev => [{
      ...event,
      id: Math.random().toString(36).substring(2, 11)
    }, ...prev].slice(0, 50));
  }, []);

  // 🔐 Secure token retrieval (FIXED)
  const getAuthToken = async (): Promise<string> => {
      try {
          // Method 1: Get from Supabase client (RECOMMENDED)
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
              console.error('❌ Supabase session error:', error);
              throw new Error('Authentication error. Please log in.');
          }
          
          if (session && session.access_token) {
              console.log('✅ Token retrieved from Supabase session');
              return session.access_token;
          }
          
          // Method 2: Fallback to localStorage (correct key format)
          const storageKey = `sb-${SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`;
          const authDataStr = localStorage.getItem(storageKey);
          
          if (authDataStr) {
              try {
                  const authData = JSON.parse(authDataStr);
                  if (authData?.access_token) {
                      console.log('✅ Token retrieved from localStorage');
                      return authData.access_token;
                  }
              } catch (parseError) {
                  console.warn('⚠️ Failed to parse localStorage token');
              }
          }
          
          // No token found
          console.error('❌ No authentication token found');
          throw new Error('No authentication token found. Please log in.');
          
      } catch (err: any) {
          console.error('❌ getAuthToken error:', err);
          throw new Error('Failed to retrieve authentication token. Please log in again.');
      }
  };

  // 🔍 Direct HTTP GET - bypasses Supabase client deadlock
  const directGetSingle = async (tableName: string, id: string) => {
    const token = await getAuthToken(); // ✅ Added await
    const url = `${SUPABASE_URL}/rest/v1/${tableName}?id=eq.${id}&select=*`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP GET ${response.status}: ${text}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  };

  const directUpdate = async (tableName: string, id: string, updates: any) => {
    const token = await getAuthToken(); // ✅ Added await
    const url = `${SUPABASE_URL}/rest/v1/${tableName}?id=eq.${id}`;
    
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP PATCH ${response.status}: ${text}`);
    }
    
    try {
      const data = await directGetSingle(tableName, id);
      return [data];
    } catch (err) {
      return [{ id, ...updates }];
    }
  };

  const directCreate = async (tableName: string, payload: any) => {
    const token = await getAuthToken(); // ✅ Added await
    const url = `${SUPABASE_URL}/rest/v1/${tableName}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  };

  const directDelete = async (tableName: string, id: string) => {
    const token = await getAuthToken(); // ✅ Added await
    const url = `${SUPABASE_URL}/rest/v1/${tableName}?id=eq.${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
  };

  const directGet = async (tableName: string) => {
    const token = await getAuthToken(); // ✅ Added await
    const url = `${SUPABASE_URL}/rest/v1/${tableName}?select=*`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    return data;
  };

  // Refresh table data
  const refreshTable = useCallback(async (tableName: string) => {
    logEvent({ endpoint: tableName, method: 'GET', source: 'DB', status: 'pending' });

    try {
      const data = await directGet(tableName);
      setDb(prev => ({ ...prev, [tableName]: data || [] }));
      logEvent({ endpoint: tableName, method: 'GET', source: 'DB', status: 'success' });
    } catch (e) {
      console.error(`❌ [DB] Refresh failed for ${tableName}:`, e);
      logEvent({ endpoint: tableName, method: 'GET', source: 'DB', status: 'error' });
    }
  }, [logEvent]);

  // Refresh all data
  const refresh = useCallback(async () => {
    try {
      const bundle = await dbService.getStartupBundle();
      if (bundle) setDb(bundle);
    } catch (e) {
      console.warn('⚠️ [DB] Startup bundle failed, falling back to basic tables');
      await refreshTable('services');
    }
  }, [refreshTable]);

  // Real-time Subscriptions for Payment Methods
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('db-realtime-payment-methods')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payment_methods' }, 
        () => {
          console.log('🔄 [Realtime] Payment methods table updated. Syncing...');
          refreshTable('payment_methods');
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [refreshTable]);

  // Public API: UPDATE entry
  const updateEntry = useCallback(async (tableName: string, id: string | number, updates: any) => {
    const cleanUpdates = { ...updates };
    ['created_at', 'updated_at', 'timestamp', 'item_ids', 'user_id', 'id'].forEach(key => delete (cleanUpdates as any)[key]);

    logEvent({ endpoint: `${tableName}/${id}`, method: 'PATCH', source: 'DB', status: 'pending' });

    try {
      const data = await directUpdate(tableName, id as string, cleanUpdates);
      logEvent({ endpoint: `${tableName}/${id}`, method: 'PATCH', source: 'DB', status: 'success' });
      return data;
    } catch (err: any) {
      logEvent({ endpoint: `${tableName}/${id}`, method: 'PATCH', source: 'DB', status: 'error' });
      throw err;
    }
  }, [logEvent]);

  // Public API: CREATE entry
  const createEntry = useCallback(async (tableName: string, payload: any) => {
    logEvent({ endpoint: tableName, method: 'POST', source: 'DB', status: 'pending' });

    try {
      const result = await directCreate(tableName, payload);
      await refreshTable(tableName);
      logEvent({ endpoint: tableName, method: 'POST', source: 'DB', status: 'success' });
      return result;
    } catch (err: any) {
      logEvent({ endpoint: tableName, method: 'POST', source: 'DB', status: 'error' });
      throw err;
    }
  }, [refreshTable, logEvent]);

  // Public API: DELETE entry
  const deleteEntry = useCallback(async (tableName: string, id: string | number) => {
    logEvent({ endpoint: `${tableName}/${id}`, method: 'DELETE', source: 'DB', status: 'pending' });

    try {
      await directDelete(tableName, id as string);
      await refreshTable(tableName);
      logEvent({ endpoint: `${tableName}/${id}`, method: 'DELETE', source: 'DB', status: 'success' });
    } catch (err: any) {
      logEvent({ endpoint: `${tableName}/${id}`, method: 'DELETE', source: 'DB', status: 'error' });
      throw err;
    }
  }, [refreshTable, logEvent]);

  // Public API: Toggle status
  const toggleStatus = useCallback(async (tableName: string, id: string | number) => {
    const list = db[tableName] || [];
    const record = list.find((r: any) => r.id === id);
    if (record) {
      const nextStatus = record.status === 'active' ? 'inactive' : 'active';
      await updateEntry(tableName, id, { status: nextStatus });
    }
  }, [db, updateEntry]);

  // Initialize data on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <DbContext.Provider value={{
      db,
      refreshTable,
      updateEntry,
      createEntry,
      deleteEntry,
      toggleStatus,
      refresh,
      networkLedger
    }}>
      {children}
    </DbContext.Provider>
  );
};

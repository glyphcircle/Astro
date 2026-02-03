import { supabase } from './supabaseClient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'seeker' | 'admin';
  credits: number;
  currency: string;
  status: 'active' | 'inactive';
  created_at: string;
  gamification?: {
    karma: number;
    streak: number;
    readingsCount: number;
    unlockedSigils: string[];
  };
}

export interface Reading {
  id: string;
  user_id: string;
  type: 'tarot' | 'palmistry' | 'astrology' | 'numerology' | 'face-reading' | 'remedy' | 'matchmaking' | 'dream-analysis';
  title: string;
  subtitle?: string;
  content: string;
  image_url?: string;
  is_favorite?: boolean;
  timestamp: string;
  created_at: string;
  meta_data?: any;
}

export class SupabaseDatabase {
  async getAll(table: string) {
    console.log(`📡 [DB] Fetching all from: ${table}`);
    if (!supabase) throw new Error("Supabase is not defined.");
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data || [];
  }

  async updateEntry(table: string, id: string | number, updates: any) {
    console.log('📡 [DB] PATCH START', { tableName: table, id, updatesKeys: Object.keys(updates) });
    console.log('📦 [DB] Full Updates Payload:', JSON.stringify(updates, null, 2)); // 🆕 ADD THIS

    if (!supabase) {
      console.error('❌ CRITICAL: supabase UNDEFINED');
      throw new Error('Supabase missing');
    }

    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select();

      console.log('📊 [DB] Supabase Response:', { data, error }); // 🆕 ADD THIS

      if (error) {
        console.error('🚨 [DB] RLS ERROR:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('⚠️ [DB] NO DATA RETURNED after update'); // 🆕 ADD THIS
        throw new Error(`No records updated for ID: ${id}`);
      }

      console.log('✅ [DB] PATCH SUCCESS:', data[0]); // 🆕 SHOW FULL RETURNED DATA
      return data;

    } catch (error: any) {
      console.error('💥 [DB] PATCH FAILED:', error.message || error);
      throw error;
    }
  }


  async createEntry(table: string, payload: any) {
    console.log('📡 [DB] CREATE START', { tableName: table, payloadKeys: Object.keys(payload) })

    if (!supabase) {
      console.error('CRITICAL: supabase object is UNDEFINED')
      throw new Error('Supabase client failed to initialize.')
    }

    const { data, error } = await supabase
      .from(table)
      .insert([payload])
      .select()

    if (error) {
      console.error('DB Create Error:', error.message)
      throw error
    }

    console.log('✅ [DB] Create Successful:', data)
    return data
  }

  async deleteEntry(table: string, id: any) {
    console.log('🗑️ [DB] DELETE START', { tableName: table, id })

    if (!supabase) {
      console.error('Supabase missing')
      throw new Error('Supabase missing')
    }

    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('DB Delete Error:', error.message)
      throw error
    }

    console.log('✅ [DB] Delete Successful for', id)
    return { success: true, deleted: data }
  }

  async checkIsAdmin(): Promise<boolean> {
    if (!supabase) return false;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const email = session.user.email?.toLowerCase();
    const ADMIN_ENTITIES = ['mitaakxi@glyphcircle.com', 'master@glyphcircle.com', 'admin@glyphcircle.com'];
    if (email && (ADMIN_ENTITIES.includes(email) || email.includes('admin@'))) return true;

    const { data } = await supabase.rpc('is_jwt_admin');
    return data === true;
  }

  async getStartupBundle() {
    try {
      console.log('📦 [DB] Fetching startup bundle...');

      // Fetch all critical tables in parallel to prevent 409 errors in UI
      const [servicesRes, configRes, providersRes, itemsRes, assetsRes, formatsRes] = await Promise.all([
        supabase.from('services').select('*'),
        supabase.from('config').select('*'),
        supabase.from('payment_providers').select('*'),
        supabase.from('store_items').select('*'),
        supabase.from('image_assets').select('*'),
        supabase.from('report_formats').select('*')
      ]);

      if (servicesRes.error) throw servicesRes.error;

      return {
        services: servicesRes.data || [],
        config: configRes.data || [],
        payment_providers: providersRes.data || [],
        store_items: itemsRes.data || [],
        image_assets: assetsRes.data || [],
        report_formats: formatsRes.data || []
      };
    } catch (err) {
      console.warn('⚠️ [DB] Startup bundle failed, falling back to individual calls');
      return null;
    }
  }


  async getConfigValue(key: string): Promise<string | null> {
    if (!supabase) return null;
    const { data } = await supabase.from('config').select('value').eq('key', key).maybeSingle();
    return data?.value || null;
  }

  // Fix: Added invokeBatchUpdate method to fix Property 'invokeBatchUpdate' does not exist error in AdminBatchEditor.tsx
  async invokeBatchUpdate(table: string, updates: any[]) {
    console.log(`📡 [DB] Invoking Batch Update for: ${table}`);
    if (!supabase) throw new Error("Supabase is not defined.");
    
    const { data, error } = await supabase.functions.invoke('admin-batch-update', {
      body: { target_table: table, updates }
    });

    if (error) {
      console.error('🚨 [DB] Batch Update Error:', error);
      throw error;
    }
    return data;
  }

  async recordTransaction(data: any) { return supabase.from('transactions').insert(data); }
  async saveReading(data: any) { return supabase.from('readings').insert(data).select().single(); }
}

export const dbService = new SupabaseDatabase();
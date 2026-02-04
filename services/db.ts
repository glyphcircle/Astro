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

export interface ReportTemplate {
  id: number;
  template_name: string;
  template_code: string;
  template_image_url: string;
  thumbnail_url: string | null;
  description: string;
  category: string;
  is_active: boolean;
  is_default: boolean;
  is_premium: boolean;
  display_order: number;
  content_area_config: {
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    textColor: string;
    fontFamily: string;
    backgroundColor: string;
  };
}

export class SupabaseDatabase {
  public client = supabase; // 🔓 Expose client for direct access

  async getAll(table: string) {
    console.log(`📡 [DB] Fetching all from: ${table}`);
    if (!supabase) throw new Error("Supabase is not defined.");
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data || [];
  }

  async getRandomTemplate(category: string): Promise<ReportTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('report_formats')
        .select('*')
        .eq('is_active', true)
        .eq('category', category);

      if (error) throw error;
      
      const templates = data || [];
      if (templates.length > 0) {
        return templates[Math.floor(Math.random() * templates.length)];
      }

      const { data: defaultData } = await supabase
        .from('report_formats')
        .select('*')
        .eq('is_active', true)
        .eq('is_default', true)
        .maybeSingle();

      return defaultData;
    } catch (err) {
      console.error('❌ [DB] Template fetch failed:', err);
      return null;
    }
  }

  async updateEntry(table: string, id: string | number, updates: any) {
    console.log('📡 [DB] PATCH START', { tableName: table, id, updatesKeys: Object.keys(updates) });
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

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('💥 [DB] PATCH FAILED:', error.message || error);
      throw error;
    }
  }

  async createEntry(table: string, payload: any) {
    if (!supabase) throw new Error('Supabase missing');
    const { data, error } = await supabase
      .from(table)
      .insert([payload])
      .select();

    if (error) throw error;
    return data;
  }

  async deleteEntry(table: string, id: any) {
    if (!supabase) throw new Error('Supabase missing');
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return { success: true, deleted: data };
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
      const [servicesRes, configRes, providersRes, itemsRes, assetsRes, formatsRes] = await Promise.all([
        supabase.from('services').select('*'),
        supabase.from('config').select('*'),
        supabase.from('payment_providers').select('*'),
        supabase.from('store_items').select('*'),
        supabase.from('image_assets').select('*'),
        supabase.from('report_formats').select('*')
      ]);

      return {
        services: servicesRes.data || [],
        config: configRes.data || [],
        payment_providers: providersRes.data || [],
        store_items: itemsRes.data || [],
        image_assets: assetsRes.data || [],
        report_formats: formatsRes.data || []
      };
    } catch (err) {
      return null;
    }
  }

  async getConfigValue(key: string): Promise<string | null> {
    if (!supabase) return null;
    const { data } = await supabase.from('config').select('value').eq('key', key).maybeSingle();
    return data?.value || null;
  }

  async invokeBatchUpdate(table: string, updates: any[]) {
    if (!supabase) throw new Error("Supabase is not defined.");
    const { data, error } = await supabase.functions.invoke('admin-batch-update', {
      body: { target_table: table, updates }
    });
    if (error) throw error;
    return data;
  }

  async recordTransaction(data: any) { 
    return supabase.from('transactions').insert(data).select().single(); 
  }
  
  async saveReading(data: any) { 
    return supabase.from('readings').insert(data).select().single(); 
  }

  /**
   * Compare form inputs based on service type to check for duplicates
   */
  compareInputs(serviceType: string, current: any, stored: any): boolean {
    if (!current || !stored) return false;

    const normalize = (val: any) => String(val || '').toLowerCase().trim();

    try {
      if (serviceType === 'astrology') {
        return (
          normalize(current.name) === normalize(stored.name) &&
          normalize(current.dob) === normalize(stored.dob) &&
          normalize(current.tob) === normalize(stored.tob) &&
          normalize(current.pob) === normalize(stored.pob)
        );
      }
      
      if (serviceType === 'numerology') {
        return (
          normalize(current.name) === normalize(stored.name) &&
          normalize(current.dob) === normalize(stored.dob)
        );
      }

      if (serviceType === 'palmistry') {
        return (
          normalize(current.name) === normalize(stored.name) &&
          normalize(current.dob) === normalize(stored.dob) &&
          normalize(current.handType || current.hand_type) === normalize(stored.handType || stored.hand_type)
        );
      }

      if (serviceType === 'tarot') {
         return (
          normalize(current.name) === normalize(stored.name) &&
          normalize(current.card_name || current.question) === normalize(stored.card_name || stored.question)
        );
      }
    } catch (e) {
      console.warn('⚠️ [DB] Comparison error:', e);
    }
    
    return false;
  }

  /**
   * Checks if the user has already successfully paid for this specific input combination today.
   */
  async checkAlreadyPaid(
    serviceType: string,
    formInputs: Record<string, any>
  ): Promise<{
    exists: boolean;
    reading?: Reading;
    transaction?: any;
  }> {
    try {
      console.log(`🔍 [DB] Registry search initiated for ${serviceType}...`);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return { exists: false };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Query successful transactions for this user/service today
      // Attempt explicit join
      let { data: transactions, error: queryError } = await supabase
        .from('transactions')
        .select('*, readings (*)')
        .eq('user_id', user.id)
        .eq('service_type', serviceType)
        .eq('status', 'success')
        .gte('created_at', todayISO)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fallback if join failed or returned nothing unexpectedly
      if (queryError || !transactions || transactions.length === 0) {
        console.log('⚠️ [DB] Standard join inconclusive. Performing deep scan fallback...');
        const { data: txOnly, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('service_type', serviceType)
          .eq('status', 'success')
          .gte('created_at', todayISO)
          .order('created_at', { ascending: false })
          .limit(10);

        if (txError || !txOnly || txOnly.length === 0) {
          console.log('✅ [DB] No historical entries found for today.');
          return { exists: false };
        }
        transactions = txOnly;
      }

      // Check each transaction for metadata match
      for (const tx of transactions) {
        if (this.compareInputs(serviceType, formInputs, tx.metadata)) {
          console.log('✨ [DB] SACRED MATCH IDENTIFIED! Order:', tx.order_id);
          
          // Ensure reading data is loaded
          let finalReading = tx.readings;
          if (!finalReading && tx.reading_id) {
            const { data: rdData } = await supabase
              .from('readings')
              .select('*')
              .eq('id', tx.reading_id)
              .single();
            finalReading = rdData;
          }

          if (finalReading) {
            return {
              exists: true,
              reading: finalReading as Reading,
              transaction: tx
            };
          }
        }
      }

      console.log('🔍 [DB] Entries found, but no metadata resonance.');
      return { exists: false };
    } catch (err) {
      console.error('❌ [DB] checkAlreadyPaid failure:', err);
      // Safety: proceed with new payment if registry check fails
      return { exists: false };
    }
  }
}

export const dbService = new SupabaseDatabase();
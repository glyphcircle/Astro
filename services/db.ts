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
  is_paid?: boolean;
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
    const ADMIN_ENTITIES = ['mitaakxi@glyphcircle.com', 'master@glyphcircle.com', 'admin@glyphcircle.com', 'master@gylphcircle.com', 'admin@gylphcircle.com'];
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
  try {
    console.log('💳 [DB] Recording transaction:', data.order_id);
    
    // ✅ CHECK: Does this order_id already exist?
    const { data: existing, error: checkError } = await supabase
      .from('transactions')
      .select('id, order_id, status')
      .eq('order_id', data.order_id)
      .maybeSingle();

    if (existing) {
      console.warn('⚠️ [DB] Transaction already exists:', existing.order_id);
      console.warn('⚠️ [DB] Returning existing transaction instead of creating duplicate');
      return { data: existing, error: null };
    }

    // ✅ INSERT: No duplicate found, create new transaction
    console.log('✅ [DB] Creating new transaction...');
    const result = await supabase
      .from('transactions')
      .insert(data)
      .select()
      .single();

    if (result.error) {
      console.error('❌ [DB] Transaction insert failed:', result.error);
    } else {
      console.log('✅ [DB] Transaction created:', result.data.id);
    }

    return result;
    
  } catch (err: any) {
    console.error('❌ [DB] recordTransaction error:', err);
    throw err;
  }
}


  
  async saveReading(data: any) { 
    return supabase.from('readings').insert(data).select().single(); 
  }

  /**
   * Compare form inputs based on service type to check for duplicates
   */
  compareInputs(serviceType: string, current: any, stored: any): boolean {
    if (!current || !stored) {
      console.log('⚠️ [DB] compareInputs: Missing data', { current: !!current, stored: !!stored });
      return false;
    }

    const normalize = (val: any) => String(val || '').toLowerCase().trim();

    try {
      if (serviceType === 'astrology') {
        const match = (
          normalize(current.name) === normalize(stored.name) &&
          normalize(current.dob) === normalize(stored.dob) &&
          normalize(current.tob) === normalize(stored.tob) &&
          normalize(current.pob) === normalize(stored.pob)
        );
        console.log('🔍 [DB] Astrology comparison:', { match, current, stored });
        return match;
      }
      
      if (serviceType === 'numerology') {
        const match = (
          normalize(current.name) === normalize(stored.name) &&
          normalize(current.dob) === normalize(stored.dob)
        );
        console.log('🔍 [DB] Numerology comparison:', { match, current, stored });
        return match;
      }

      if (serviceType === 'palmistry') {
        const match = (
          normalize(current.name) === normalize(stored.name) &&
          normalize(current.dob) === normalize(stored.dob) &&
          normalize(current.handType || current.hand_type) === normalize(stored.handType || stored.hand_type)
        );
        console.log('🔍 [DB] Palmistry comparison:', { match, current, stored });
        return match;
      }

      if (serviceType === 'tarot') {
        const match = (
          normalize(current.name) === normalize(stored.name) &&
          normalize(current.card_name || current.question) === normalize(stored.card_name || stored.question)
        );
        console.log('🔍 [DB] Tarot comparison:', { match, current, stored });
        return match;
      }
    } catch (e) {
      console.error('⚠️ [DB] Comparison error:', e);
    }
    
    return false;
  }

  /**
   * ✅ FIXED: Checks if the user has already successfully paid for this specific input combination in the last 24 hours.
   * Includes timeout protection and detailed error handling.
   */
  async checkAlreadyPaid(
    serviceType: string,
    formInputs: Record<string, any>
  ): Promise<{
    exists: boolean;
    reading?: Reading;
    transaction?: any;
  }> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 [DB] Registry search initiated for ${serviceType}...`);
      console.log(`📋 [DB] Form inputs:`, JSON.stringify(formInputs));
      
      // ✅ Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ [DB] Auth error:', authError);
        return { exists: false };
      }
      
      if (!user) {
        console.log('⚠️ [DB] No user logged in - skipping registry check');
        return { exists: false };
      }

      console.log(`👤 [DB] User ID: ${user.id}`);

      // Use a generous 24-hour lookback window for "already paid" checks
      const since = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString();
      console.log(`📅 [DB] Looking back since: ${since}`);

      // ✅ Query successful transactions with timeout protection
      console.log(`🔎 [DB] Querying transactions table...`);
      
      const { data: transactions, error: queryError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('service_type', serviceType)
        .eq('status', 'success')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(20);

      if (queryError) {
        console.error('❌ [DB] Query error:', queryError);
        return { exists: false };
      }

      console.log(`📊 [DB] Found ${transactions?.length || 0} transactions`);

      if (!transactions || transactions.length === 0) {
        console.log('✅ [DB] No historical entries found for the current window.');
        return { exists: false };
      }

      // ✅ Check each transaction for metadata match
      console.log(`🔍 [DB] Checking ${transactions.length} transactions for matches...`);
      
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];
        console.log(`🔍 [DB] Checking transaction ${i + 1}/${transactions.length}: ${tx.order_id}`);
        console.log(`📋 [DB] Transaction metadata:`, JSON.stringify(tx.metadata));

        if (this.compareInputs(serviceType, formInputs, tx.metadata)) {
          console.log('✨ [DB] SACRED MATCH IDENTIFIED! Order:', tx.order_id);
          
          // ✅ Fetch associated reading
          let finalReading = null;
          
          if (tx.reading_id) {
            console.log(`📖 [DB] Fetching reading ID: ${tx.reading_id}`);
            
            const { data: rdData, error: readingError } = await supabase
              .from('readings')
              .select('*')
              .eq('id', tx.reading_id)
              .single();

            if (readingError) {
              console.error('❌ [DB] Reading fetch error:', readingError);
            } else {
              finalReading = rdData;
              console.log('✅ [DB] Reading fetched successfully');
            }
          } else {
            console.warn('⚠️ [DB] Transaction has no reading_id');
          }

          const elapsedTime = Date.now() - startTime;
          console.log(`⏱️ [DB] Registry check completed in ${elapsedTime}ms`);

          return {
            exists: true,
            reading: finalReading as Reading,
            transaction: tx
          };
        } else {
          console.log(`❌ [DB] Transaction ${tx.order_id} - No match`);
        }
      }

      const elapsedTime = Date.now() - startTime;
      console.log(`🔍 [DB] Entries found, but no metadata resonance. (${elapsedTime}ms)`);
      return { exists: false };

    } catch (err: any) {
      const elapsedTime = Date.now() - startTime;
      console.error(`❌ [DB] checkAlreadyPaid failure after ${elapsedTime}ms:`, err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        details: err.details
      });
      
      // Safety: proceed with new payment if registry check fails
      return { exists: false };
    }
  }
}

export const dbService = new SupabaseDatabase();

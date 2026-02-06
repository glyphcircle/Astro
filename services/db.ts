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
  // Stats from v_user_dashboard_summary
  total_spent?: number;
  transaction_count?: number;
  readings_count?: number;
  paid_readings_count?: number;
  theme?: string;
  theme_settings?: any;
  gamification?: {
    karma: number;
    streak: number;
    readingsCount: number;
    unlockedSigils: string[];
  };
}

export interface Reading {
  id: string; // Maps from reading_id in v_user_readings_history
  user_id: string;
  type: 'tarot' | 'palmistry' | 'astrology' | 'numerology' | 'face-reading' | 'remedy' | 'matchmaking' | 'dream-analysis';
  title: string;
  subtitle?: string;
  content: string;
  image_url?: string;
  is_favorite?: boolean;
  timestamp: string; // Maps from reading_date in v_user_readings_history
  created_at: string;
  meta_data?: any;
  is_paid?: boolean;
  // Payment details from history view
  payment_amount?: number;
  payment_currency?: string;
  payment_status?: string;
}

export interface StoreItemWithStock {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  status: string;
  sku: string;
  system_stock: number;
  reserved_stock: number;
  available_stock: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  low_stock_threshold: number;
  allow_backorder: boolean;
  total_stock_in: number;
  total_stock_out: number;
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
  source_type: 'format' | 'template';
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
  public client = supabase;

  async getAll(table: string) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data || [];
  }

  /**
   * Optimized Template Fetching using v_report_templates_with_format
   */
  async getRandomTemplate(category: string): Promise<ReportTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('v_report_templates_with_format')
        .select('*')
        .eq('is_active', true)
        .eq('category', category);

      if (error) throw error;
      
      if (data && data.length > 0) {
        return data[Math.floor(Math.random() * data.length)];
      }

      const { data: defaultData } = await supabase
        .from('v_report_templates_with_format')
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
    console.log('📡 [DB] PATCH START', { tableName: table, id, updatesKeys: Object.keys(updates) })

    if (!supabase) {
      console.error('❌ CRITICAL: supabase UNDEFINED')
      throw new Error("Supabase missing");
    }

    ['image', 'image_url', 'logo_url'].forEach(field => {
      if (updates[field] && updates[field].length > 200) {
        const driveMatch = updates[field].match(/\/d\/([a-zA-Z0-9_-]+)/)
        if (driveMatch) {
          updates[field] = `https://drive.google.com/uc?id=${driveMatch[1]}`
        }
      }
    })

    try {
      const { error: updateError } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)

      if (updateError) throw updateError;

      const { data, error: selectError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()

      if (selectError) return [{ id, ...updates }];
      return [data];
    } catch (error: any) {
      console.error('💥 [DB] UPDATE FAILED:', error.message || error)
      throw error
    }
  }

  async createEntry(table: string, payload: any) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase
      .from(table)
      .insert([payload])
      .select();

    if (error) throw error;
    return data;
  }

  async deleteEntry(table: string, id: any) {
    if (!supabase) throw new Error("Supabase client not initialized.");
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
    const ADMIN_ENTITIES = [
      'mitaakxi@glyphcircle.com', 
      'master@glyphcircle.com', 
      'admin@glyphcircle.com', 
      'master@gylphcircle.com', 
      'admin@gylphcircle.com'
    ];
    if (email && (ADMIN_ENTITIES.includes(email) || email.includes('admin@'))) return true;

    const { data } = await supabase.rpc('is_jwt_admin');
    return data === true;
  }

  /**
   * Optimized Bundle Fetch using 13 specialized Views
   */
  async getStartupBundle() {
    try {
      const [servicesRes, configRes, providersRes, itemsRes, assetsRes, formatsRes, gemstoneRes] = await Promise.all([
        supabase.from('v_active_services').select('*'),
        supabase.from('config').select('*'),
        supabase.from('v_active_payment_methods').select('*'),
        supabase.from('v_store_items_with_stock').select('*'),
        supabase.from('v_image_assets_by_type').select('*'),
        supabase.from('v_report_templates_with_format').select('*'),
        supabase.from('v_active_gemstones').select('*')
      ]);

      return {
        services: servicesRes.data || [],
        config: configRes.data || [],
        payment_providers: providersRes.data || [],
        store_items: itemsRes.data || [],
        image_assets: assetsRes.data || [],
        report_formats: formatsRes.data || [],
        gemstones: gemstoneRes.data || []
      };
    } catch (err) {
      console.error('❌ [DB] Bundle fetch failed:', err);
      return null;
    }
  }

  async getConfigValue(key: string): Promise<string | null> {
    if (!supabase) return null;
    const { data } = await supabase.from('config').select('value').eq('key', key).maybeSingle();
    return data?.value || null;
  }

  async invokeBatchUpdate(table: string, updates: any[]) {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase.functions.invoke('admin-batch-update', {
      body: { target_table: table, updates }
    });
    if (error) throw error;
    return data;
  }

  async recordTransaction(data: any) {
    try {
      const { data: existing } = await supabase
        .from('transactions')
        .select('id, order_id')
        .eq('order_id', data.order_id)
        .maybeSingle();

      if (existing) return { data: existing, error: null };

      return await supabase.from('transactions').insert(data).select().single();
    } catch (err) {
      console.error('❌ [DB] Transaction record failed:', err);
      throw err;
    }
  }
  
  async saveReading(readingData: any) {
    try {
      const { data, error } = await supabase
        .from('readings')
        .insert([readingData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('💥 [DB] Save Reading ERROR:', err.message)
      const fallbackKey = `reading_fallback_${Date.now()}`
      localStorage.setItem(fallbackKey, JSON.stringify(readingData))
      return { data: { ...readingData, id: fallbackKey }, error: err };
    }
  }

  normalizeInputs(serviceType: string, rawInputs: any) {
    const normalized = { ...rawInputs }
    if (normalized.dob) {
      const dateStr = normalized.dob.toString()
      let parsed: Date | null = null
      const ddmmyyyy = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/)
      if (ddmmyyyy) parsed = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`)
      const mmddyyyy = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
      if (mmddyyyy) parsed = new Date(`${mmddyyyy[3]}-${mmddyyyy[1]}-${mmddyyyy[2]}`)
      if (!parsed && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) parsed = new Date(dateStr)
      if (parsed && !isNaN(parsed.getTime())) normalized.dob = parsed.toISOString().split('T')[0]
    }
    if (normalized.name) normalized.name = normalized.name.trim().toLowerCase()
    if (normalized.pob) normalized.pob = normalized.pob.trim().toLowerCase()
    if (normalized.tob) normalized.tob = normalized.tob.replace(/\s+/g, '')
    return normalized
  }

  async checkAlreadyPaid(serviceType: string, formInputs: Record<string, any>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { exists: false };

      const inputs = this.normalizeInputs(serviceType, formInputs);
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: txs, error } = await supabase
        .from('v_recent_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('service_type', serviceType)
        .eq('status', 'success')
        .gte('transaction_date', since)
        .order('transaction_date', { ascending: false });

      if (error || !txs) return { exists: false };

      for (const tx of txs) {
        const storedInputs = this.normalizeInputs(serviceType, tx.metadata || {});
        
        let isMatch = false;
        if (serviceType === 'astrology') {
          isMatch = (storedInputs.name === inputs.name && storedInputs.dob === inputs.dob && storedInputs.tob === inputs.tob && storedInputs.pob === inputs.pob);
        } else if (serviceType === 'numerology' || serviceType === 'palmistry' || serviceType === 'face-reading') {
          isMatch = (storedInputs.name === inputs.name && storedInputs.dob === inputs.dob);
        } else if (serviceType === 'tarot') {
          isMatch = (storedInputs.name === inputs.name && (storedInputs.card_name === inputs.card_name || storedInputs.question === inputs.question));
        }

        if (isMatch) {
          let readingData = null;
          if (tx.reading_id) {
            const { data } = await supabase.from('v_user_readings_history').select('*').eq('reading_id', tx.reading_id).single();
            if (data) {
                readingData = { id: data.reading_id, ...data, timestamp: data.reading_date };
            }
          }
          return { exists: true, transaction: tx, reading: readingData as Reading };
        }
      }
      return { exists: false };
    } catch (err) {
      return { exists: false };
    }
  }
}

export const dbService = new SupabaseDatabase();
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
  public client = supabase;

  async getAll(table: string) {
    if (!supabase) throw new Error("Supabase client not initialized.");
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
      
      if (data && data.length > 0) {
        return data[Math.floor(Math.random() * data.length)];
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
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
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

      if (existing) {
        return { data: existing, error: null };
      }

      return await supabase.from('transactions').insert(data).select().single();
    } catch (err) {
      console.error('❌ [DB] Transaction record failed:', err);
      throw err;
    }
  }
  
  async saveReading(data: any) { 
    return supabase.from('readings').insert(data).select().single(); 
  }

  compareInputs(serviceType: string, current: any, stored: any): boolean {
    if (!current || !stored) return false;
    const norm = (v: any) => String(v || '').toLowerCase().trim();

    try {
      if (serviceType === 'astrology') {
        return (
          norm(current.name) === norm(stored.name) &&
          norm(current.dob) === norm(stored.dob) &&
          norm(current.tob) === norm(stored.tob) &&
          norm(current.pob) === norm(stored.pob)
        );
      }
      if (serviceType === 'numerology') {
        return norm(current.name) === norm(stored.name) && norm(current.dob) === norm(stored.dob);
      }
      if (serviceType === 'palmistry') {
        return norm(current.name) === norm(stored.name) && norm(current.dob) === norm(stored.dob);
      }
      if (serviceType === 'tarot') {
        return norm(current.name) === norm(stored.name) && norm(current.card_name || current.question) === norm(stored.card_name || stored.question);
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  async checkAlreadyPaid(serviceType: string, formInputs: Record<string, any>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { exists: false };

      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: txs, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('service_type', serviceType)
        .eq('status', 'success')
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (error || !txs) return { exists: false };

      for (const tx of txs) {
        if (this.compareInputs(serviceType, formInputs, tx.metadata)) {
          let readingData = null;
          if (tx.reading_id) {
            const { data } = await supabase.from('readings').select('*').eq('id', tx.reading_id).single();
            readingData = data;
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
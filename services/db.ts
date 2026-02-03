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
  async getAll(table: string) {
    console.log(`📡 [DB] Fetching all from: ${table}`);
    if (!supabase) throw new Error("Supabase is not defined.");
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data || [];
  }

  async getRandomTemplate(category: string): Promise<ReportTemplate | null> {
    try {
      // First try to find a category specific template
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

      // Fallback to a default template if no category match
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

  async recordTransaction(data: any) { return supabase.from('transactions').insert(data); }
  async saveReading(data: any) { return supabase.from('readings').insert(data).select().single(); }
}

export const dbService = new SupabaseDatabase();
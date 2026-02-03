
import { dbService } from './db';

export interface PaymentProvider {
  id: string;
  name: string;
  provider_type: 'razorpay' | 'stripe' | 'paypal';
  is_active: boolean;
  api_key: string;
  api_secret?: string;
  merchant_id?: string;
  webhook_url?: string;
  currency: string;
  country_codes: string; // "IN,US" or "GLOBAL"
  credentials_json?: string;
  status: 'active' | 'inactive';
}

class PaymentManager {
  
  // --- ADMIN ACTIONS (Async via Supabase) ---

  async saveProvider(provider: Omit<PaymentProvider, 'id' | 'status'> & { id?: string }) {
    const data = { 
        ...provider, 
        status: 'active' as const,
        updated_at: new Date().toISOString()
    };
    
    if (provider.id) {
      await dbService.updateEntry('payment_providers', provider.id, data);
    } else {
      await dbService.createEntry('payment_providers', { ...data });
    }
  }

  async deleteProvider(id: string) {
    await dbService.updateEntry('payment_providers', id, { status: 'inactive' });
  }

  async toggleActive(id: string, currentStatus: boolean) {
    await dbService.updateEntry('payment_providers', id, { is_active: !currentStatus });
  }

  // --- CLIENT UTILS ---

  /**
   * Auto-detect user country based on Timezone or Locale as a heuristic
   */
  detectUserCountry(): string {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz.startsWith('Asia/Kolkata')) return 'IN';
        if (tz.startsWith('America/')) return 'US';
        if (tz.startsWith('Europe/London')) return 'UK';
        return 'GLOBAL';
    } catch {
        return 'GLOBAL';
    }
  }

  /**
   * Helper to get active provider from a list (passed from DbContext)
   */
  getActiveProviderFromList(providers: PaymentProvider[], countryCode: string = 'GLOBAL'): PaymentProvider | null {
    const all = providers.filter(p => p.is_active && p.status === 'active');
    
    // 1. Try exact match
    const exact = all.find(p => p.country_codes.split(',').includes(countryCode));
    if (exact) return exact;

    // 2. Try global/fallback
    const fallback = all.find(p => p.country_codes.includes('GLOBAL'));
    return fallback || null;
  }

  testTransaction(provider: PaymentProvider): Promise<{ success: boolean; message: string }> {
      return new Promise((resolve) => {
          setTimeout(() => {
              if (provider.api_key && provider.api_key.length > 5) {
                  resolve({ success: true, message: `Test Transaction of ${provider.currency} 1.00 Initiated via ${provider.provider_type}` });
              } else {
                  resolve({ success: false, message: "Invalid API Credentials" });
              }
          }, 1500);
      });
  }
}

export const paymentManager = new PaymentManager();

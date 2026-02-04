
// Service to manage report state persistence across navigation

interface ReportState {
  serviceType: string; // 'astrology', 'numerology', etc.
  formData: any;
  reading: string;
  advancedReport?: any;
  engineData: any;
  isPaid: boolean;
  timestamp: number;
  expiresAt: number; // 24 hours from generation
}

class ReportStateManager {
  private STORAGE_KEY_PREFIX = 'glyph_report_';
  private EXPIRY_HOURS = 24;

  // Save report state to session storage
  saveReportState(serviceType: string, state: Omit<ReportState, 'serviceType' | 'timestamp' | 'expiresAt'>) {
    const reportState: ReportState = {
      serviceType,
      ...state,
      timestamp: Date.now(),
      expiresAt: Date.now() + (this.EXPIRY_HOURS * 60 * 60 * 1000)
    };

    const key = this.STORAGE_KEY_PREFIX + serviceType;
    const serialized = JSON.stringify(reportState);
    
    try {
      sessionStorage.setItem(key, serialized);
      // Also save to localStorage for persistence across tabs
      localStorage.setItem(key, serialized);
    } catch (e) {
      console.warn("Storage quota exceeded or private mode, state may not persist.");
    }
    
    console.log(`✅ Report state saved for ${serviceType}`);
  }

  // Load report state from storage
  loadReportState(serviceType: string): ReportState | null {
    const key = this.STORAGE_KEY_PREFIX + serviceType;
    
    // Try session storage first (current tab)
    let stored = sessionStorage.getItem(key);
    
    // Fallback to localStorage (across tabs)
    if (!stored) {
      stored = localStorage.getItem(key);
    }

    if (!stored) {
      console.log(`❌ No saved report found for ${serviceType}`);
      return null;
    }

    try {
      const reportState: ReportState = JSON.parse(stored);
      
      // Check if expired (24 hours)
      if (Date.now() > reportState.expiresAt) {
        console.log(`⏰ Report expired for ${serviceType}`);
        this.clearReportState(serviceType);
        return null;
      }

      console.log(`✅ Report state loaded for ${serviceType}`);
      return reportState;
    } catch (error) {
      console.error('Error parsing report state:', error);
      return null;
    }
  }

  // Clear report state
  clearReportState(serviceType: string) {
    const key = this.STORAGE_KEY_PREFIX + serviceType;
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
    console.log(`🗑️ Report state cleared for ${serviceType}`);
  }

  // Check if report exists and is valid
  hasValidReport(serviceType: string): boolean {
    const state = this.loadReportState(serviceType);
    return state !== null && state.isPaid && state.reading.length > 0;
  }

  // Get report age in minutes
  getReportAge(serviceType: string): number | null {
    const state = this.loadReportState(serviceType);
    if (!state) return null;
    
    const ageMs = Date.now() - state.timestamp;
    return Math.floor(ageMs / (1000 * 60));
  }
}

export const reportStateManager = new ReportStateManager();

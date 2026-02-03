
import { securityService } from './security';

export const secureStorage = {
  setItem: async (key: string, value: any): Promise<void> => {
    try {
      const stringValue = JSON.stringify(value);
      const encrypted = await securityService.encryptData(stringValue);
      localStorage.setItem(`secure_${key}`, encrypted);
    } catch (e) {
      console.error("Secure Storage Write Error", e);
    }
  },

  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const raw = localStorage.getItem(`secure_${key}`);
      if (!raw) return null;
      const decrypted = await securityService.decryptData(raw);
      if (!decrypted) return null;
      return JSON.parse(decrypted) as T;
    } catch (e) {
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(`secure_${key}`);
  }
};

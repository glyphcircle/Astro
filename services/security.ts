/**
 * Enhanced Security Service
 * Combines encryption, integrity checks, and payment validation
 */

export class SecurityService {
  private static instance: SecurityService;
  private encryptionKey: CryptoKey | null = null;
  private readonly SALT = "GLYPH_CIRCLE_V2_SALT_#9928";

  private constructor() {
    this.init();
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  async init() {
    try {
      await this.generateDeviceBoundKey();
    } catch (error) {
      console.warn('⚠️ Encryption initialization failed (non-critical):', error);
      // Continue without encryption - app will still work
    }
  }

  // --- 1. DEVICE BINDING & KEY GENERATION ---
  private async generateDeviceBoundKey() {
    // ✅ Check if crypto APIs are available
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      console.warn('⚠️ Web Crypto API not available - encryption disabled');
      return;
    }

    let deviceId = localStorage.getItem('glyph_device_id');
    if (!deviceId) {
      deviceId = this.generateUUID();
      localStorage.setItem('glyph_device_id', deviceId);
    }

    try {
      // Mix device ID with app salt to create a unique key material
      const enc = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(deviceId + this.SALT),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );

      this.encryptionKey = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: enc.encode("salty_buffer"),
          iterations: 100000,
          hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );

      console.log('✅ Device-bound encryption key generated');
    } catch (error) {
      console.warn('⚠️ Key generation failed:', error);
      this.encryptionKey = null;
    }
  }

  // ✅ Browser-compatible UUID generator
  private generateUUID(): string {
    // Try native crypto.randomUUID first
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      try {
        return crypto.randomUUID();
      } catch (e) {
        // Fallback if randomUUID fails
      }
    }
    
    // Fallback: Generate UUID manually
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // --- 2. AES-256 ENCRYPTION ---
  async encryptData(data: string): Promise<string> {
    // ✅ Return plain data if encryption not available
    if (!this.encryptionKey || !window.crypto || !window.crypto.subtle) {
      console.warn('⚠️ Encryption not available - storing as plain text');
      return btoa(data); // Base64 encode at minimum
    }

    try {
      if (!this.encryptionKey) await this.init();
      
      const enc = new TextEncoder();
      const encodedData = enc.encode(data);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        this.encryptionKey!,
        encodedData
      );

      const encryptedArray = new Uint8Array(encryptedContent);
      const buf = new Uint8Array(iv.byteLength + encryptedArray.byteLength);
      buf.set(iv, 0);
      buf.set(encryptedArray, iv.byteLength);

      return this.bufferToBase64(buf);
    } catch (error) {
      console.error('Encryption failed:', error);
      return btoa(data); // Fallback to base64
    }
  }

  async decryptData(base64Data: string): Promise<string | null> {
    // ✅ Try to decrypt, fallback to base64 decode
    if (!this.encryptionKey || !window.crypto || !window.crypto.subtle) {
      try {
        return atob(base64Data);
      } catch {
        return base64Data;
      }
    }

    try {
      if (!this.encryptionKey) await this.init();

      const data = this.base64ToBuffer(base64Data);
      const iv = data.slice(0, 12);
      const content = data.slice(12);

      const decryptedContent = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        this.encryptionKey!,
        content
      );

      const dec = new TextDecoder();
      return dec.decode(decryptedContent);
    } catch (e) {
      console.warn("Decryption failed, trying base64 decode:", e);
      try {
        return atob(base64Data);
      } catch {
        return null;
      }
    }
  }

  // --- 3. INTEGRITY DETECTION ---
  checkSystemIntegrity(): boolean {
    const checks = {
      isSecureContext: window.isSecureContext || window.location.protocol === 'https:',
      hasAutomation: !!(navigator.webdriver),
      isFrame: window.self !== window.top
    };

    if (!checks.isSecureContext) {
      if (import.meta.env.PROD) {
        console.error("CRITICAL SECURITY WARNING: Insecure Context in Production");
      } else {
        console.warn("⚠️ Development mode: Insecure context detected");
      }
    }
    if (checks.hasAutomation) console.warn("SECURITY WARNING: Automation Detected");

    // In development, allow local network
    if (!import.meta.env.PROD) {
      const hostname = window.location.hostname;
      const isLocalNetwork = 
        hostname === 'localhost' || 
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.');
      
      if (isLocalNetwork) {
        return !checks.hasAutomation;
      }
    }

    return checks.isSecureContext && !checks.hasAutomation;
  }

  // --- 4. SECURE CONTEXT CHECK ---
  isSecureContext(): boolean {
    const hostname = window.location.hostname;
    
    if (
      hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return true;
    }
    
    return window.isSecureContext || window.location.protocol === 'https:';
  }

  // --- 5. PAYMENT ENVIRONMENT VALIDATION ---
  validatePaymentEnvironment(): { valid: boolean; error?: string } {
    const hostname = window.location.hostname;
    const isLocalNetwork = 
      hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.');

    if (isLocalNetwork && !import.meta.env.PROD) {
      console.log('✅ Local network detected - payment environment validated');
      
      if (typeof (window as any).puter === 'undefined') {
        return {
          valid: false,
          error: 'Payment service not initialized. Please refresh the page.'
        };
      }
      
      return { valid: true };
    }

    if (!this.isSecureContext() && import.meta.env.PROD) {
      return {
        valid: false,
        error: 'Payment processing requires a secure HTTPS connection'
      };
    }

    if (!this.checkSystemIntegrity()) {
      return {
        valid: false,
        error: 'Security check failed. Please ensure you are using a secure browser.'
      };
    }

    if (typeof (window as any).puter === 'undefined') {
      return {
        valid: false,
        error: 'Payment service not initialized. Please refresh the page.'
      };
    }

    return { valid: true };
  }

  // --- 6. ENVIRONMENT INFO ---
  isProduction(): boolean {
    return import.meta.env.PROD;
  }

  isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  getEnvironmentInfo() {
    return {
      mode: import.meta.env.MODE,
      isSecure: this.isSecureContext(),
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      isProd: this.isProduction(),
      isDev: this.isDevelopment(),
      hasEncryption: this.encryptionKey !== null,
      deviceId: localStorage.getItem('glyph_device_id'),
      systemIntegrity: this.checkSystemIntegrity()
    };
  }

  getDeviceId(): string | null {
    return localStorage.getItem('glyph_device_id');
  }

  resetDeviceId(): void {
    localStorage.removeItem('glyph_device_id');
    this.encryptionKey = null;
    this.init();
  }

  // --- HELPERS ---
  private bufferToBase64(buf: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < buf.byteLength; i++) {
      binary += String.fromCharCode(buf[i]);
    }
    return window.btoa(binary);
  }

  private base64ToBuffer(base64: string): Uint8Array {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

export const securityService = SecurityService.getInstance();

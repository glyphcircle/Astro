
// DATABASE SECURITY HELPER (Web Equivalent)
// Implements AES-256-GCM, Integrity Checks, and Device Binding

class SecurityService {
  private encryptionKey: CryptoKey | null = null;
  private readonly SALT = "GLYPH_CIRCLE_V2_SALT_#9928"; // In prod, this should be dynamic

  constructor() {
    this.init();
  }

  async init() {
    await this.generateDeviceBoundKey();
  }

  // --- 1. DEVICE BINDING & KEY GENERATION ---
  private async generateDeviceBoundKey() {
    let deviceId = localStorage.getItem('glyph_device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('glyph_device_id', deviceId);
    }

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
  }

  // --- 2. AES-256 ENCRYPTION (SQLCipher Equivalent) ---
  async encryptData(data: string): Promise<string> {
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
  }

  async decryptData(base64Data: string): Promise<string | null> {
    if (!this.encryptionKey) await this.init();

    try {
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
      console.error("Security Breach: Decryption failed. Data may be tampered.", e);
      return null;
    }
  }

  // --- 3. ROOT / INTEGRITY DETECTION (Web Equivalent) ---
  checkSystemIntegrity(): boolean {
    const checks = {
      isSecureContext: window.isSecureContext, // Must be HTTPS/Localhost
      hasAutomation: !!(navigator.webdriver), // Detect Selenium/Puppeteer
      isFrame: window.self !== window.top // Detect Clickjacking
    };

    if (!checks.isSecureContext) console.warn("SECURITY WARNING: Insecure Context");
    if (checks.hasAutomation) console.warn("SECURITY WARNING: Automation Detected");

    // Return false if environment is compromised
    return checks.isSecureContext && !checks.hasAutomation;
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

export const securityService = new SecurityService();

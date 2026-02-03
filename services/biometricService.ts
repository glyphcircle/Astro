
// WebAuthn Biometric Service
// Handles Face ID / Touch ID / Windows Hello integration

function bufferToBase64(buffer: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export const biometricService = {
  // Check availability
  isAvailable: async (): Promise<boolean> => {
    try {
      if (window.PublicKeyCredential &&
          PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
    } catch (e) {
      console.debug("Biometric check failed (likely restricted context):", e);
    }
    return false;
  },

  // Register New Biometric Credential
  register: async (userId: string, userName: string): Promise<string | null> => {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Safe hostname for blob origins
      const safeHostname = window.location.hostname || 'glyph.circle.app';

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Glyph Circle",
          id: safeHostname,
        },
        user: {
          id: Uint8Array.from(userId, c => c.charCodeAt(0)),
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "none"
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (credential) {
        return bufferToBase64(credential.rawId);
      }
      return null;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.message?.includes('not enabled')) {
          console.warn("WebAuthn blocked by permissions policy.");
          return null; 
      }
      console.warn("Biometric Registration Failed:", err);
      throw err;
    }
  },

  // Verify Existing Biometric Credential
  verify: async (credentialIdBase64?: string): Promise<boolean> => {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: "required",
        allowCredentials: credentialIdBase64 ? [{
          id: base64ToBuffer(credentialIdBase64),
          type: "public-key",
          transports: ["internal"]
        }] : undefined
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;

      return !!assertion;
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.message?.includes('not enabled')) {
          console.warn("Biometric authentication blocked.");
          throw new Error("Biometric authentication not allowed.");
      }
      console.debug("Biometric Verification unavailable:", err);
      throw err;
    }
  }
};

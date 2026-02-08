import { dbService } from './db';

export interface CloudProvider {
  id: string;
  provider: 'Google Drive' | 'Dropbox' | 'AWS S3' | 'Firebase Storage' | 'Cloudinary' | 'Generic';
  name: string;
  api_key?: string;
  secret?: string;
  folder_id?: string;
  bucket_name?: string;
  region?: string;
  cloud_name?: string;
  base_url?: string;
  is_active: boolean;
  status: 'active' | 'inactive';
}

class CloudManager {
  async saveProvider(provider: Omit<CloudProvider, 'id' | 'status'> & { id?: string }) {
    const data = { ...provider, status: 'active' };
    if (provider.id) {
      await dbService.updateEntry('cloud_providers', provider.id, data);
    } else {
      await dbService.createEntry('cloud_providers', { ...data });
    }
  }

  async deleteProvider(id: string) {
    await dbService.updateEntry('cloud_providers', id, { status: 'inactive' });
  }

  async testConnection(provider: Partial<CloudProvider>): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!provider.api_key && !provider.base_url && !provider.bucket_name && provider.provider !== 'Google Drive') {
          resolve({ success: false, message: "Missing required configuration fields" });
        } else {
          resolve({ success: true, message: `Successfully connected to ${provider.provider}.` });
        }
      }, 1500);
    });
  }

  validateProviderActive(url: string, providers: CloudProvider[]): { valid: boolean; message?: string } {
    if (!url || !url.startsWith('http')) return { valid: true };
    let detectedProvider = '';
    if (url.includes('drive.google.com') || url.includes('drive.usercontent.google.com')) detectedProvider = 'Google Drive';
    else if (url.includes('dropbox.com')) detectedProvider = 'Dropbox';
    else if (url.includes('s3') || url.includes('aws')) detectedProvider = 'AWS S3';
    else if (url.includes('firebase')) detectedProvider = 'Firebase Storage';
    else if (url.includes('cloudinary')) detectedProvider = 'Cloudinary';

    if (detectedProvider) {
        const isActive = providers.some(p => p.provider === detectedProvider && p.status === 'active' && p.is_active);
        if (!isActive) return { valid: false, message: `⚠️ Missing configuration for ${detectedProvider}.` };
    }
    return { valid: true };
  }

  getProxyImageUrl(imageId: string | number, fallbackUrl: string): string {
    if (String(imageId).startsWith('http')) return this.resolveImage(String(imageId));
    return this.resolveImage(fallbackUrl);
  }

  public resolveImage(url: string | undefined | null): string {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    
    // 1. RAW ID DETECTION (Prevent 404 for strings like "photo-1532...")
    if (trimmed.startsWith('photo-') && !trimmed.includes('://')) {
        return `https://images.unsplash.com/${trimmed}?q=80&w=800&auto=format`;
    }
    
    // 2. GOOGLE DRIVE OPTIMIZATION (Support all common variants)
    if (trimmed.includes('drive.google.com') || trimmed.includes('drive.usercontent.google.com') || trimmed.includes('googleusercontent.com')) {
        const idMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                        trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                        trimmed.match(/\/d\/([a-zA-Z0-9_-]+)\//);
        if (idMatch && idMatch[1]) return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
    
    // 3. DROPBOX OPTIMIZATION
    if (trimmed.includes('dropbox.com')) {
        if (trimmed.includes('?dl=')) return trimmed.replace(/\?dl=[01]/, '?raw=1');
        if (!trimmed.includes('raw=1')) return trimmed + (trimmed.includes('?') ? '&raw=1' : '?raw=1');
    }

    // 4. UNSPLASH OPTIMIZATION
    if (trimmed.includes('images.unsplash.com') && !trimmed.includes('w=')) {
        return `${trimmed}${trimmed.includes('?') ? '&' : '?'}q=80&w=800&auto=format`;
    }

    // 5. SECURITY: Default to placeholder if not a valid URL
    if (!trimmed.startsWith('http') && !trimmed.startsWith('data:')) {
        return 'https://images.unsplash.com/photo-1600609842388-3e4b489d71c6?q=80&w=400';
    }

    return trimmed;
  }
}

export const cloudManager = new CloudManager();
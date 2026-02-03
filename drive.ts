
/**
 * Converts a standard Google Drive sharing link into a direct embeddable image URL.
 */
// Fix: Added the implementation for toDriveEmbedUrl as it was being imported in AdminDB.tsx but the file was empty, which caused the "not a module" error.
export const toDriveEmbedUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  // Logic to extract file ID from common Google Drive URL patterns
  const idMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                  url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                  url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
                  
  if (idMatch && idMatch[1]) {
    // Returns the direct link to the image content via Google's content delivery domain
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }
  
  return url;
};

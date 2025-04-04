
import { STORAGE_KEYS } from '../constants';
import { toast } from "@/hooks/use-toast";

/**
 * Manages Google OAuth credentials
 */
export class CredentialsManager {
  /**
   * Check if client ID is configured
   */
  isConfigured(): boolean {
    const { clientId } = this.getCredentials();
    return !!clientId && clientId.length > 0;
  }
  
  /**
   * Get stored credentials
   */
  getCredentials(): { clientId: string; clientSecret: string } {
    const clientId = localStorage.getItem(STORAGE_KEYS.CLIENT_ID) || '';
    const clientSecret = localStorage.getItem(STORAGE_KEYS.CLIENT_SECRET) || '';
    return { clientId, clientSecret };
  }
  
  /**
   * Update Google client ID
   */
  setClientId(clientId: string): void {
    if (!clientId || clientId.trim() === '') {
      return;
    }
    
    const trimmedClientId = clientId.trim();
    localStorage.setItem(STORAGE_KEYS.CLIENT_ID, trimmedClientId);
    console.log("Client ID set:", trimmedClientId);
    
    // Notify that credentials have changed
    document.dispatchEvent(new CustomEvent('google-credentials-updated'));
  }
  
  /**
   * Update Google client secret
   */
  setClientSecret(clientSecret: string): void {
    if (clientSecret === undefined) return;
    
    const trimmedSecret = clientSecret.trim();
    
    if (trimmedSecret) {
      localStorage.setItem(STORAGE_KEYS.CLIENT_SECRET, trimmedSecret);
      console.log("Client Secret set");
    } else {
      localStorage.removeItem(STORAGE_KEYS.CLIENT_SECRET);
      console.log("Client Secret cleared");
    }
    
    // Notify that credentials have changed
    document.dispatchEvent(new CustomEvent('google-credentials-updated'));
  }
}

export const credentialsManager = new CredentialsManager();

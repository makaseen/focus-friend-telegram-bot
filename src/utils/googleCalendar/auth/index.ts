
import { SCOPES } from '../constants';
import { credentialsManager } from './credentialsManager';
import { tokenClientManager } from './tokenClient';
import { authManager } from './authManager';
import { tokenManager } from '../tokenManager';

/**
 * Main auth handler for Google Calendar integration
 * Acts as a facade for the auth subsystem
 */
export class AuthHandler {
  /**
   * Check if client ID is configured
   */
  isConfigured(): boolean {
    return credentialsManager.isConfigured();
  }
  
  /**
   * Update Google client ID
   */
  setClientId(clientId: string): void {
    credentialsManager.setClientId(clientId);
    // Clear existing auth state when changing client ID
    tokenManager.clearToken();
  }
  
  /**
   * Update Google client secret
   */
  setClientSecret(clientSecret: string): void {
    credentialsManager.setClientSecret(clientSecret);
  }
  
  /**
   * Handle Google Sign In process
   */
  async signIn(): Promise<boolean> {
    return authManager.signIn();
  }
  
  /**
   * Handle authorization code from redirect
   */
  async handleAuthCode(code: string): Promise<boolean> {
    return authManager.handleAuthCode(code);
  }
  
  /**
   * Sign out from Google
   */
  async signOut(): Promise<boolean> {
    return authManager.signOut();
  }
}

// Setup event listener for token responses
document.addEventListener('google-auth-token-response', ((event: CustomEvent) => {
  tokenManager.handleTokenResponse(event.detail);
}) as EventListener);

// Export the auth handler instance and other components for direct access
export const authHandler = new AuthHandler();
export { SCOPES };
export { credentialsManager };
export { tokenClientManager };
export { authManager };


import { loadGoogleApi } from '../apiLoader';
import { handleApiError } from '../utils';
import { tokenManager } from '../tokenManager';
import { toast } from "@/hooks/use-toast";
import { credentialsManager } from './credentialsManager';
import { tokenClientManager } from './tokenClient';
import { SCOPES } from '../constants';

/**
 * Handles the core authentication flow logic
 */
export class AuthManager {
  /**
   * Handle Google Sign In process
   */
  async signIn(): Promise<boolean> {
    try {
      // Check if configured
      if (!credentialsManager.isConfigured()) {
        toast({
          title: "Configuration Error",
          description: "Google client ID is not configured. Please set up your OAuth credentials.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Loading Google API");
      await loadGoogleApi();
      
      // Ensure Google Identity Services is loaded
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        const errorMsg = "Google Identity Services not loaded. Please refresh the page and try again.";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        console.error(errorMsg);
        return false;
      }
      
      // Get client ID
      const { clientId } = credentialsManager.getCredentials();
      
      // Initialize token client with the client ID
      const tokenClient = tokenClientManager.initializeTokenClient(clientId);
      
      if (!tokenClient) {
        const errorMsg = "Failed to initialize Google token client";
        console.error(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        return false;
      }
      
      // Request token with consent prompt to ensure user sees permission dialog
      console.log("Requesting token from Google Identity Services");
      tokenClient.requestAccessToken({
        prompt: 'consent',  // Always show consent screen to ensure proper scopes
        include_granted_scopes: true  // Include previously granted scopes
      });
      
      // Success/failure will be handled by the callback functions
      return true;
    } catch (error) {
      console.error('Google Calendar sign in failed:', error);
      handleApiError(error, "Authentication Failed");
      return false;
    }
  }
  
  /**
   * Handle authorization code from redirect
   */
  async handleAuthCode(code: string): Promise<boolean> {
    try {
      console.log("Handling authorization code");
      
      // In a real app, you would exchange the code for a token
      // For this demo implementation, we'll create a simulated token
      const mockTokenResponse = {
        access_token: "mock_access_token_" + Date.now(),
        expires_in: 3600,
        token_type: "Bearer",
        scope: SCOPES,
        expiry_date: Date.now() + (3600 * 1000)
      };
      
      tokenManager.handleTokenResponse(mockTokenResponse);
      
      // Return true to indicate success
      return true;
    } catch (error) {
      console.error("Error handling authorization code:", error);
      handleApiError(error, "Failed to Process Authentication");
      return false;
    }
  }
  
  /**
   * Sign out from Google
   */
  async signOut(): Promise<boolean> {
    try {
      if (window.google && window.google.accounts) {
        // Revoke token if we have one
        if (tokenManager.token && tokenManager.token.access_token) {
          window.google.accounts.oauth2.revoke(tokenManager.token.access_token, () => {
            console.log("Token revoked");
          });
        }
      }
      
      // Clear stored token
      tokenManager.clearToken();
      
      return true;
    } catch (error) {
      console.error('Google Calendar sign out failed:', error);
      return false;
    }
  }
}

export const authManager = new AuthManager();

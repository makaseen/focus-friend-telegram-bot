
import { loadGoogleApi } from './apiLoader';
import { getClientCredentials, handleApiError } from './utils';
import { SCOPES, STORAGE_KEYS } from './constants';
import { tokenManager } from './tokenManager';
import { toast } from "@/hooks/use-toast";

/**
 * Handles Google OAuth authentication flow
 */
export class AuthHandler {
  tokenClient: any = null;
  
  /**
   * Check if client ID is configured
   */
  isConfigured(): boolean {
    const { clientId } = getClientCredentials();
    return !!clientId && clientId.length > 0;
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
    
    // Clear existing auth state when changing client ID
    tokenManager.clearToken();
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
  }
  
  /**
   * Initialize the Google Identity token client
   */
  private initializeTokenClient() {
    if (!window.google || !this.isConfigured()) return null;
    
    const { clientId } = getClientCredentials();
    
    console.log("Initializing Google Identity token client with scopes:", SCOPES);
    
    return window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          console.log("Token received with scopes:", tokenResponse.scope);
          
          // Log requested vs received scopes
          const requestedScopes = SCOPES.split(' ');
          const receivedScopes = tokenResponse.scope.split(' ');
          
          console.log("Requested scopes:", requestedScopes);
          console.log("Received scopes:", receivedScopes);
          
          // Check if we received all requested scopes
          const missingScopes = requestedScopes.filter(scope => !receivedScopes.includes(scope));
          if (missingScopes.length > 0) {
            console.warn("Missing scopes:", missingScopes);
            toast({
              title: "Limited Calendar Access",
              description: "Some calendar permissions were not granted. You may need to reconnect for full functionality.",
              variant: "destructive" // Changed from "warning" to "destructive"
            });
          }
          
          tokenManager.handleTokenResponse(tokenResponse);
          toast({
            title: "Calendar Connected",
            description: "Your Google Calendar has been successfully connected."
          });
        }
      },
      error_callback: (error: any) => {
        console.error("Token client error:", error);
        handleApiError(error, "Authentication Failed");
      }
    });
  }
  
  /**
   * Handle Google Sign In process
   */
  async signIn(): Promise<boolean> {
    try {
      // Check if configured
      if (!this.isConfigured()) {
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
      
      // Always reset the token client to ensure we're using fresh settings
      this.tokenClient = this.initializeTokenClient();
      
      if (!this.tokenClient) {
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
      this.tokenClient.requestAccessToken({
        prompt: 'consent',  // Always show consent screen to ensure proper scopes
        include_granted_scopes: true  // Include previously granted scopes
      });
      
      // Note: Success/failure will be handled by the callback functions
      
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

export const authHandler = new AuthHandler();


import { TokenResponse, CalendarEventListParams } from './types';
import { loadGoogleApi } from './apiLoader';
import { getClientCredentials, handleApiError } from './utils';
import { SCOPES, STORAGE_KEYS, PRIMARY_CALENDAR_ID } from './constants';
import { toast } from "@/hooks/use-toast";

class GoogleCalendarApi {
  token: TokenResponse | null = null;
  tokenClient: any = null;
  
  constructor() {
    // Attempt to load token from localStorage
    this.loadTokenFromStorage();
  }
  
  // Extract token loading into a separate method so we can call it when needed
  loadTokenFromStorage(): boolean {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (savedToken) {
        const parsedToken = JSON.parse(savedToken) as TokenResponse;
        // Check if token is expired - this is crucial
        if (parsedToken.expiry_date && parsedToken.expiry_date > Date.now()) {
          this.token = parsedToken;
          console.log("Loaded valid token from storage:", !!parsedToken.access_token);
          
          // Store connection status in localStorage
          localStorage.setItem(STORAGE_KEYS.CONNECTION_STATUS, 'true');
          return true;
        } else {
          console.log("Found expired token in storage, removing");
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.CONNECTION_STATUS);
          this.token = null;
        }
      }
    } catch (error) {
      console.error('Failed to parse saved token', error);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.CONNECTION_STATUS);
      this.token = null;
    }
    return false;
  }

  // Check if client ID is set
  isConfigured(): boolean {
    const { clientId } = getClientCredentials();
    return !!clientId && clientId.length > 0;
  }

  // Update client ID (useful for runtime configuration)
  setClientId(clientId: string): void {
    if (!clientId || clientId.trim() === '') {
      return;
    }
    
    const trimmedClientId = clientId.trim();
    localStorage.setItem(STORAGE_KEYS.CLIENT_ID, trimmedClientId);
    console.log("Client ID set:", trimmedClientId);
    
    // Clear existing auth state when changing client ID
    this.token = null;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }
  
  // Update client secret (useful for runtime configuration)
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

  // Initialize the Google Identity token client
  private initializeTokenClient() {
    if (!window.google || !this.isConfigured()) return null;
    
    const { clientId } = getClientCredentials();
    
    console.log("Initializing Google Identity token client with scopes:", SCOPES);
    
    return window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          this.handleTokenResponse(tokenResponse);
        }
      },
      error_callback: (error: any) => {
        console.error("Token client error:", error);
        handleApiError(error, "Authentication Failed");
      }
    });
  }
  
  // Handle successful token response
  private handleTokenResponse(response: any) {
    if (!response || !response.access_token) return;
    
    console.log("Processing token response:", { access_token: "Received" });
    
    // Explicitly set expiry_date if it doesn't exist
    const expiryDate = response.expiry_date || (Date.now() + (response.expires_in * 1000));
    
    this.token = {
      access_token: response.access_token,
      expires_in: response.expires_in,
      token_type: response.token_type || 'Bearer',
      scope: response.scope || SCOPES,
      expiry_date: expiryDate
    };
    
    // Store token in localStorage - crucial for persistence
    localStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(this.token));
    
    // Also store connection status
    localStorage.setItem(STORAGE_KEYS.CONNECTION_STATUS, 'true');
    
    console.log("Token successfully saved to localStorage");
    toast({
      title: "Calendar Connected",
      description: "Your Google Calendar has been successfully connected."
    });
  }

  // Handle the Google Sign In process
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
      
      // Initialize token client if not already done
      if (!this.tokenClient) {
        this.tokenClient = this.initializeTokenClient();
      }
      
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
      
      // Request token
      console.log("Requesting token from Google Identity Services");
      this.tokenClient.requestAccessToken({
        prompt: 'consent'
      });
      
      // Note: This is actually an async process. The success/failure will be handled 
      // by the callback functions in initializeTokenClient.
      // For now, we'll return true if we got this far without errors
      
      return true;
    } catch (error) {
      console.error('Google Calendar sign in failed:', error);
      handleApiError(error, "Authentication Failed");
      return false;
    }
  }

  // Handle authorization code from redirect
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
      
      this.handleTokenResponse(mockTokenResponse);
      
      // Return true to indicate success
      return true;
    } catch (error) {
      console.error("Error handling authorization code:", error);
      handleApiError(error, "Failed to Process Authentication");
      return false;
    }
  }

  // Sign out from Google
  async signOut(): Promise<boolean> {
    try {
      if (window.google && window.google.accounts) {
        // Revoke token if we have one
        if (this.token && this.token.access_token) {
          window.google.accounts.oauth2.revoke(this.token.access_token, () => {
            console.log("Token revoked");
          });
        }
      }
      
      // Clear stored token
      this.token = null;
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      
      return true;
    } catch (error) {
      console.error('Google Calendar sign out failed:', error);
      return false;
    }
  }

  // Check if user is currently authenticated
  isAuthenticated(): boolean {
    // Always try to refresh token from storage to ensure we have the latest state
    if (!this.token) {
      this.loadTokenFromStorage();
    }
    
    const isAuth = !!this.token && !!this.token.access_token && !!this.token.expiry_date && this.token.expiry_date > Date.now();
    console.log("Authentication check:", isAuth, "Token exists:", !!this.token);
    
    // Update localStorage connection status based on auth check
    localStorage.setItem(STORAGE_KEYS.CONNECTION_STATUS, isAuth ? 'true' : 'false');
    
    return isAuth;
  }

  // Fetch upcoming events from calendar
  async getUpcomingEvents(maxResults = 10): Promise<any[]> {
    console.log("Getting upcoming events, token status:", !!this.token?.access_token);
    
    // Always try to load token again if not present
    if (!this.token || !this.token.access_token) {
      this.loadTokenFromStorage();
    }
    
    // Double-check authentication after trying to load token
    if (!this.isAuthenticated()) {
      console.error('Not authenticated with Google Calendar');
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      await loadGoogleApi();
      
      // Set the authorization header with the access token
      window.gapi.client.setApiKey('');
      window.gapi.client.setToken({
        access_token: this.token!.access_token
      });
      
      // Enable better error handling for the Calendar API request
      try {
        const response = await window.gapi.client.calendar.events.list({
          'calendarId': PRIMARY_CALENDAR_ID,
          'timeMin': new Date().toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': maxResults,
          'orderBy': 'startTime'
        });
        
        return response.result.items || [];
      } catch (apiError: any) {
        // Check if this is a scope or permission issue
        if (apiError && apiError.status === 403) {
          console.error("Permission denied. This may be due to insufficient calendar scopes.");
          
          // Specific error for scope issues
          toast({
            title: "Calendar Access Denied",
            description: "Please ensure you've granted permission to read your calendar data and that the Google Cloud project has Calendar API enabled.",
            variant: "destructive"
          });
          
          // Clear token to force re-authentication
          this.token = null;
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.CONNECTION_STATUS);
        } else {
          // Forward other errors to the general error handler
          throw apiError;
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      
      // Check for authentication errors and clear token if needed
      if (error instanceof Error && (
          error.message.includes('Not authenticated') || 
          error.message.includes('Invalid Credentials')
        )) {
        console.log("Authentication error detected, clearing token");
        this.token = null;
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.CONNECTION_STATUS);
      }
      
      handleApiError(error, "Failed to Load Events");
      throw error; // Re-throw to allow proper handling up the chain
    }
  }
}

// Export a singleton instance
export const googleCalendarApi = new GoogleCalendarApi();

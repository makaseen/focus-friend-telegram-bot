
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
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (savedToken) {
      try {
        const parsedToken = JSON.parse(savedToken) as TokenResponse;
        // Check if token is expired
        if (parsedToken.expiry_date && parsedToken.expiry_date > Date.now()) {
          this.token = parsedToken;
        } else {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
        }
      } catch (error) {
        console.error('Failed to parse saved token', error);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
    }
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
    
    console.log("Initializing Google Identity token client");
    
    return window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      // Important: Explicitly request Calendar scope with read-only access
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
    
    this.token = {
      access_token: response.access_token,
      expires_in: response.expires_in,
      token_type: 'Bearer',
      scope: response.scope,
      expiry_date: Date.now() + (response.expires_in * 1000)
    };
    
    localStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(this.token));
    
    console.log("Successfully authenticated with Google");
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
      
      // In a complete implementation, you would exchange this code for a token
      // using your server-side implementation
      
      // For this demo, we'll simulate a successful token response
      // In a real app, you would make an API call to exchange the code
      
      const mockTokenResponse = {
        access_token: "mock_access_token_" + Date.now(),
        expires_in: 3600,
        scope: SCOPES,
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
    return !!this.token;
  }

  // Fetch upcoming events from calendar
  async getUpcomingEvents(maxResults = 10): Promise<any[]> {
    if (!this.token) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      await loadGoogleApi();
      
      // Set the authorization header with the access token
      window.gapi.client.setApiKey('');
      window.gapi.client.setToken({
        access_token: this.token.access_token
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
          
          // Try to sign out and clear token to force re-authentication
          this.signOut();
        } else {
          // Forward other errors to the general error handler
          throw apiError;
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      handleApiError(error, "Failed to Load Events");
      return [];
    }
  }
}

// Export a singleton instance
export const googleCalendarApi = new GoogleCalendarApi();

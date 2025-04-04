
import { TokenResponse, CalendarEventListParams } from './types';
import { loadGoogleApi } from './apiLoader';
import { getClientCredentials, handleApiError } from './utils';
import { SCOPES, STORAGE_KEYS, PRIMARY_CALENDAR_ID } from './constants';
import { toast } from "@/hooks/use-toast";

class GoogleCalendarApi {
  token: TokenResponse | null = null;
  
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
      
      console.log("Attempting to load Google API");
      await loadGoogleApi();
      
      console.log("Getting auth instance");
      const googleAuth = window.gapi.auth2.getAuthInstance();
      
      // Check if already signed in
      if (googleAuth.isSignedIn.get()) {
        console.log("User is already signed in");
        const currentUser = googleAuth.currentUser.get();
        const authResponse = currentUser.getAuthResponse();
        
        this.token = {
          access_token: authResponse.access_token,
          expires_in: authResponse.expires_in,
          token_type: 'Bearer',
          scope: SCOPES,
          expiry_date: Date.now() + (authResponse.expires_in * 1000)
        };
        
        localStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(this.token));
        return true;
      }
      
      console.log("Signing in with Google");
      const user = await googleAuth.signIn({
        prompt: 'consent' // Always show the consent screen
      });
      
      const authResponse = user.getAuthResponse();
      
      console.log("Successfully authenticated with Google");
      
      this.token = {
        access_token: authResponse.access_token,
        expires_in: authResponse.expires_in,
        token_type: 'Bearer',
        scope: SCOPES,
        expiry_date: Date.now() + (authResponse.expires_in * 1000)
      };

      // Save token to localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(this.token));
      
      return true;
    } catch (error) {
      console.error('Google Calendar sign in failed:', error);
      handleApiError(error, "Authentication Failed");
      return false;
    }
  }

  // Sign out from Google
  async signOut(): Promise<boolean> {
    try {
      if (window.gapi && window.gapi.auth2) {
        const googleAuth = window.gapi.auth2.getAuthInstance();
        await googleAuth.signOut();
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
      
      await window.gapi.client.load('calendar', 'v3');
      
      const response = await window.gapi.client.calendar.events.list({
        'calendarId': PRIMARY_CALENDAR_ID,
        'timeMin': new Date().toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': maxResults,
        'orderBy': 'startTime'
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      handleApiError(error, "Failed to Load Events");
      return [];
    }
  }
}

// Export a singleton instance
export const googleCalendarApi = new GoogleCalendarApi();

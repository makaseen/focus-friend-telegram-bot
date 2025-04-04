
import { toast } from "@/hooks/use-toast";

// Google Calendar API scopes needed for our application
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

// Get the client ID from environment or use a placeholder for development
// In a production app, this should be set properly in your hosting environment
let CLIENT_ID = '';

// Try to load CLIENT_ID from window.__ENV__ if available (useful for production deployments)
try {
  if (window.__ENV__ && window.__ENV__.GOOGLE_CLIENT_ID) {
    CLIENT_ID = window.__ENV__.GOOGLE_CLIENT_ID;
  }
} catch (e) {
  console.error('Could not load environment variables', e);
}

// Load from localStorage if available
try {
  const savedClientId = localStorage.getItem('googleCalendarClientId');
  if (savedClientId) {
    CLIENT_ID = savedClientId;
  }
} catch (e) {
  console.error('Could not load client ID from localStorage', e);
}

// Display meaningful error message for common OAuth errors
const getOAuthErrorMessage = (error: any): string => {
  console.error('OAuth error details:', error);
  
  if (error?.error === 'invalid_client') {
    return "Invalid OAuth client ID. Please make sure you've configured a valid Google Cloud project with OAuth credentials.";
  }
  
  if (error?.error === 'access_denied') {
    return "You denied access to your Google Calendar.";
  }
  
  // Check for specific error messages in the error object
  if (error?.details && typeof error.details === 'string' && error.details.includes('invalid_client')) {
    return "Invalid OAuth client ID. Please check your Google Cloud Console configuration.";
  }
  
  return "An error occurred during Google authentication. Please try again.";
};

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

class GoogleCalendarApi {
  token: TokenResponse | null = null;
  gapiLoaded: boolean = false;
  gapiInitialized: boolean = false;
  
  constructor() {
    // Attempt to load token from localStorage
    const savedToken = localStorage.getItem('googleCalendarToken');
    if (savedToken) {
      try {
        const parsedToken = JSON.parse(savedToken) as TokenResponse;
        // Check if token is expired
        if (parsedToken.expiry_date && parsedToken.expiry_date > Date.now()) {
          this.token = parsedToken;
        } else {
          localStorage.removeItem('googleCalendarToken');
        }
      } catch (error) {
        console.error('Failed to parse saved token', error);
        localStorage.removeItem('googleCalendarToken');
      }
    }
  }

  // Initialize the Google API client
  loadGoogleApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if client ID is configured
      if (!CLIENT_ID) {
        const errorMsg = "Google client ID is not configured. Please set up your OAuth credentials.";
        console.error(errorMsg);
        reject(new Error(errorMsg));
        return;
      }
      
      // If already loaded and initialized, resolve immediately
      if (this.gapiInitialized && window.gapi) {
        resolve();
        return;
      }

      // Add script to DOM if not already present
      if (!document.getElementById('google-api-script')) {
        const script = document.createElement('script');
        script.id = 'google-api-script';
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log("Google API script loaded");
          this.gapiLoaded = true;
          // Initialize the client
          this.initializeGapiClient(resolve, reject);
        };

        script.onerror = (error) => {
          console.error("Error loading Google API script:", error);
          reject(error);
        };

        document.body.appendChild(script);
      } else if (window.gapi) {
        // Script already loaded
        this.gapiLoaded = true;
        this.initializeGapiClient(resolve, reject);
      } else {
        // Script in DOM but not loaded yet
        const checkGapi = setInterval(() => {
          if (window.gapi) {
            clearInterval(checkGapi);
            this.gapiLoaded = true;
            this.initializeGapiClient(resolve, reject);
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkGapi);
          reject(new Error("Timeout waiting for Google API to load"));
        }, 10000);
      }
    });
  }

  // Initialize the GAPI client library
  private initializeGapiClient(resolve: () => void, reject: (error: any) => void): void {
    if (!window.gapi) {
      reject(new Error("Google API not loaded"));
      return;
    }

    window.gapi.load('client:auth2', () => {
      try {
        console.log("Initializing Google API client with client ID:", CLIENT_ID);
        window.gapi.client.init({
          clientId: CLIENT_ID,
          scope: SCOPES,
          plugin_name: 'Focus Friend'
        }).then(() => {
          console.log("Google API client initialized successfully");
          this.gapiInitialized = true;
          resolve();
        }).catch((error: any) => {
          console.error("Error initializing Google API client:", error);
          const errorMessage = getOAuthErrorMessage(error);
          toast({
            title: "Google API Initialization Failed",
            description: errorMessage,
            variant: "destructive"
          });
          reject(error);
        });
      } catch (error) {
        console.error("Exception initializing Google API client:", error);
        reject(error);
      }
    });
  }

  // Check if client ID is set
  isConfigured(): boolean {
    return !!CLIENT_ID && CLIENT_ID.length > 0;
  }

  // Update client ID (useful for runtime configuration)
  setClientId(clientId: string): void {
    if (!clientId || clientId.trim() === '') {
      return;
    }
    
    CLIENT_ID = clientId.trim();
    localStorage.setItem('googleCalendarClientId', CLIENT_ID);
    console.log("Client ID set:", CLIENT_ID);
    
    // Clear existing auth state when changing client ID
    this.token = null;
    localStorage.removeItem('googleCalendarToken');
    this.gapiInitialized = false;
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
      await this.loadGoogleApi();
      
      console.log("Getting auth instance");
      const googleAuth = window.gapi.auth2.getAuthInstance();
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
      localStorage.setItem('googleCalendarToken', JSON.stringify(this.token));
      
      return true;
    } catch (error) {
      console.error('Google Calendar sign in failed:', error);
      const errorMessage = getOAuthErrorMessage(error);
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive"
      });
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
      localStorage.removeItem('googleCalendarToken');
      
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
      await this.loadGoogleApi();
      
      await window.gapi.client.load('calendar', 'v3');
      
      const response = await window.gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': new Date().toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': maxResults,
        'orderBy': 'startTime'
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast({
        title: "Failed to Load Events",
        description: "Could not retrieve your calendar events",
        variant: "destructive"
      });
      return [];
    }
  }
}

export const googleCalendarApi = new GoogleCalendarApi();

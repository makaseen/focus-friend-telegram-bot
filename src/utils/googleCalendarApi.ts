
import { toast } from "@/hooks/use-toast";

// Google Calendar API scopes needed for our application
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

// This would be your Google OAuth client ID from the Google Cloud Console
// In a real app, you might want to store this more securely
const CLIENT_ID = '123456789012-example.apps.googleusercontent.com';

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
      // If already loaded, resolve immediately
      if (this.gapiLoaded && window.gapi) {
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
          // Initialize the client
          window.gapi.load('client:auth2', () => {
            window.gapi.client.init({
              clientId: CLIENT_ID,
              scope: SCOPES,
              plugin_name: 'Focus Friend'
            }).then(() => {
              console.log("Google API client initialized");
              this.gapiLoaded = true;
              resolve();
            }).catch((error: any) => {
              console.error("Error initializing Google API client:", error);
              reject(error);
            });
          });
        };

        script.onerror = (error) => {
          console.error("Error loading Google API script:", error);
          reject(error);
        };

        document.body.appendChild(script);
      } else {
        // Script already in DOM but not fully loaded
        const checkGapi = setInterval(() => {
          if (window.gapi) {
            clearInterval(checkGapi);
            if (!window.gapi.auth2) {
              window.gapi.load('client:auth2', () => {
                window.gapi.client.init({
                  clientId: CLIENT_ID,
                  scope: SCOPES,
                  plugin_name: 'Focus Friend'
                }).then(() => {
                  console.log("Google API client initialized");
                  this.gapiLoaded = true;
                  resolve();
                }).catch((error: any) => {
                  console.error("Error initializing Google API client:", error);
                  reject(error);
                });
              });
            } else {
              this.gapiLoaded = true;
              resolve();
            }
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

  // Handle the Google Sign In process
  async signIn(): Promise<boolean> {
    try {
      console.log("Attempting to load Google API");
      await this.loadGoogleApi();
      
      console.log("Getting auth instance");
      const googleAuth = window.gapi.auth2.getAuthInstance();
      console.log("Signing in with Google");
      const user = await googleAuth.signIn();
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
      toast({
        title: "Authentication Failed",
        description: "Could not connect to Google Calendar",
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

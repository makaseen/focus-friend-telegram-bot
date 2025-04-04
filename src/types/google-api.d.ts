
// Type definitions for Google API Client

interface Window {
  __ENV__?: {
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    [key: string]: any;
  };
  google?: {
    accounts: {
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: any) => void;
          error_callback?: (error: any) => void;
        }) => {
          requestAccessToken: (options?: { prompt?: 'none' | 'consent' | 'select_account' }) => void;
        };
        revoke: (token: string, callback?: () => void) => void;
      };
    };
  };
  gapi: {
    load: (api: string, callback: () => void) => void;
    client: {
      init: (params?: {
        clientId?: string;
        apiKey?: string;
        scope?: string;
        plugin_name?: string;
      }) => Promise<void>;
      setToken: (token: { access_token: string }) => void;
      setApiKey: (apiKey: string) => void;
      load: (api: string, version: string) => Promise<void>;
      calendar: {
        events: {
          list: (params: {
            calendarId: string;
            timeMin: string;
            showDeleted: boolean;
            singleEvents: boolean;
            maxResults: number;
            orderBy: string;
          }) => Promise<{
            result: {
              items: GoogleCalendarEvent[];
            }
          }>;
          insert: (params: any) => Promise<any>;
          update: (params: any) => Promise<any>;
          delete: (params: any) => Promise<any>;
        }
      }
    };
    auth2?: {
      getAuthInstance: () => {
        isSignedIn: { 
          get: () => boolean;
          listen: (callback: (isSignedIn: boolean) => void) => void;
        };
        currentUser: {
          get: () => {
            getBasicProfile: () => {
              getId: () => string;
              getName: () => string;
              getEmail: () => string;
            },
            getAuthResponse: (includeAuthorizationData?: boolean) => {
              access_token: string;
              expires_in: number;
              scope: string;
              token_type: string;
            }
          }
        };
        signIn: (options?: { prompt?: 'none' | 'consent' | 'select_account' }) => Promise<{
          getAuthResponse: () => {
            access_token: string;
            expires_in: number;
            scope: string;
            token_type: string;
          }
        }>;
        signOut: () => Promise<void>;
      }
    }
  }
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status: string;
  htmlLink: string;
  created: string;
  updated: string;
  creator: {
    email: string;
    displayName?: string;
  };
  organizer: {
    email: string;
    displayName?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  [key: string]: any;
}

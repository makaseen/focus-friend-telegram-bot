
// Type definitions for Google API Client

interface Window {
  __ENV__?: {
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    [key: string]: any;
  };
  gapi: {
    load: (api: string, callback: () => void) => void;
    client: {
      init: (params: {
        clientId: string;
        apiKey?: string;
        scope: string;
        plugin_name?: string;
      }) => Promise<void>;
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
              items: any[];
            }
          }>;
          insert: (params: any) => Promise<any>;
          update: (params: any) => Promise<any>;
          delete: (params: any) => Promise<any>;
        }
      }
    };
    auth2: {
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


// Type definitions for Google API Client

interface Window {
  __ENV__?: {
    GOOGLE_CLIENT_ID?: string;
    [key: string]: any;
  };
  gapi: {
    load: (api: string, callback: () => void) => void;
    client: {
      init: (params: {
        clientId: string;
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
        }
      }
    };
    auth2: {
      getAuthInstance: () => {
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

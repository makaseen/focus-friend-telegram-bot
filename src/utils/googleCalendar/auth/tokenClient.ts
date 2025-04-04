
import { handleApiError } from '../utils';
import { SCOPES } from '../constants';
import { toast } from "@/hooks/use-toast";

/**
 * Manages the Google Identity token client for authentication
 */
export class TokenClientManager {
  tokenClient: any = null;

  /**
   * Initialize the Google Identity token client
   */
  initializeTokenClient(clientId: string): any {
    if (!window.google) {
      console.error("Google API not loaded");
      return null;
    }

    console.log("Initializing Google Identity token client with scopes:", SCOPES);
    
    try {
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
                variant: "destructive"
              });
            }
            
            // Use the authEvents to emit the token response
            document.dispatchEvent(
              new CustomEvent('google-auth-token-response', { detail: tokenResponse })
            );
            
            toast({
              title: "Calendar Connected",
              description: "Your Google Calendar has been successfully connected."
            });
          } else {
            console.error("Invalid token response received:", tokenResponse);
            toast({
              title: "Authentication Error",
              description: "Failed to receive a valid authentication token.",
              variant: "destructive"
            });
          }
        },
        error_callback: (error: any) => {
          console.error("Token client error:", error);
          handleApiError(error, "Authentication Failed");
        }
      });
    } catch (error) {
      console.error("Exception during token client initialization:", error);
      handleApiError(error, "Authentication Initialization Failed");
      return null;
    }
  }
}

export const tokenClientManager = new TokenClientManager();


import { toast } from "@/hooks/use-toast";

// Get the client ID and secret from environment or localStorage
export const getClientCredentials = (): { clientId: string; clientSecret: string } => {
  let clientId = '';
  let clientSecret = '';

  // Try to load from window.__ENV__ if available (useful for production deployments)
  try {
    if (window.__ENV__ && window.__ENV__.GOOGLE_CLIENT_ID) {
      clientId = window.__ENV__.GOOGLE_CLIENT_ID;
    }
    if (window.__ENV__ && window.__ENV__.GOOGLE_CLIENT_SECRET) {
      clientSecret = window.__ENV__.GOOGLE_CLIENT_SECRET;
    }
  } catch (e) {
    console.error('Could not load environment variables', e);
  }

  // Load from localStorage if available
  try {
    const savedClientId = localStorage.getItem('googleCalendarClientId');
    if (savedClientId) {
      clientId = savedClientId;
    }
    
    const savedClientSecret = localStorage.getItem('googleCalendarClientSecret');
    if (savedClientSecret) {
      clientSecret = savedClientSecret;
    }
  } catch (e) {
    console.error('Could not load client credentials from localStorage', e);
  }

  return { clientId, clientSecret };
};

// Display meaningful error message for common OAuth errors
export const getOAuthErrorMessage = (error: any): string => {
  console.error('OAuth error details:', error);
  
  if (!error) {
    return "An unknown authentication error occurred. Please check your console for details.";
  }
  
  // Check for Google Calendar API specific errors
  if (error.body) {
    try {
      // Try to parse the error body if it's a string
      const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
      if (errorBody.error) {
        if (errorBody.error.message) {
          // Handle specific Google Calendar API errors
          if (errorBody.error.code === 403) {
            return "Access forbidden. Please verify that your Google Cloud project has the Calendar API enabled and that you've granted the necessary permissions. You may need to re-authorize the application.";
          }
          return errorBody.error.message;
        }
      }
    } catch (e) {
      // If parsing fails, fall back to other error handling
      console.error('Error parsing API error body', e);
    }
  }
  
  if (typeof error === 'string') {
    // New Google Identity errors
    if (error.includes('not_initialized') || error.includes('Missing required parameter')) {
      return "Google OAuth initialization failed. Please ensure your Google OAuth Client ID is correct.";
    }
    if (error.includes('popup_closed_by_user')) {
      return "You closed the authentication popup. Please try again.";
    }
    if (error.includes('popup_blocked')) {
      return "Authentication popup was blocked. Please allow popups for this site and try again.";
    }
    return error;
  }
  
  if (error?.error === 'invalid_client') {
    return "Invalid OAuth client ID. Please make sure you've configured a valid Google Cloud project with OAuth credentials and that your application's domain is added to the authorized JavaScript origins.";
  }
  
  if (error?.error === 'access_denied') {
    return "You denied access to your Google Calendar.";
  }
  
  // Handle errors from Google Identity Services
  if (error?.type === 'popup_closed_by_user') {
    return "You closed the authentication popup. Please try again.";
  }
  
  if (error?.type === 'popup_blocked_by_browser') {
    return "Authentication popup was blocked by your browser. Please allow popups for this site and try again.";
  }
  
  if (error?.details) {
    if (typeof error.details === 'string') {
      if (error.details.includes('invalid_client')) {
        return "Invalid OAuth client ID. Please check your Google Cloud Console configuration and ensure your domain is authorized.";
      }
      if (error.details.includes('disallowed_useragent')) {
        return "Google doesn't allow OAuth popups on this browser or device. Please try on a different browser.";
      }
      return error.details;
    }
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return "An error occurred during Google authentication. Please check your Google Cloud Console configuration and try again.";
};

// Helper to handle API errors with toast notifications
export const handleApiError = (error: any, title: string = "API Error"): void => {
  console.error(title, error);
  const errorMessage = getOAuthErrorMessage(error);
  toast({
    title,
    description: errorMessage,
    variant: "destructive"
  });
};

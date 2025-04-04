
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
  
  if (typeof error === 'string') {
    if (error.includes('idpframe_initialization_failed')) {
      return "OAuth initialization failed. Please ensure your Google OAuth Client ID is correct and the app is properly configured in the Google Cloud Console.";
    }
    return error;
  }
  
  if (error?.error === 'invalid_client') {
    return "Invalid OAuth client ID. Please make sure you've configured a valid Google Cloud project with OAuth credentials and that your application's domain is added to the authorized JavaScript origins.";
  }
  
  if (error?.error === 'access_denied') {
    return "You denied access to your Google Calendar.";
  }
  
  if (error?.details) {
    if (typeof error.details === 'string') {
      if (error.details.includes('invalid_client')) {
        return "Invalid OAuth client ID. Please check your Google Cloud Console configuration and ensure your domain is authorized.";
      }
      if (error.details.includes('idpframe_initialization_failed')) {
        return "Google OAuth initialization failed. Please verify your Google Cloud Console settings and make sure your OAuth credentials are correctly configured.";
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

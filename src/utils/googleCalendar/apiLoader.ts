
import { getClientCredentials } from './utils';
import { handleApiError } from './utils';
import { SCOPES } from './constants';

// Initialize the Google API client
export const loadGoogleApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { clientId } = getClientCredentials();
    
    // Check if client ID is configured
    if (!clientId) {
      const errorMsg = "Google client ID is not configured. Please set up your OAuth credentials.";
      console.error(errorMsg);
      reject(new Error(errorMsg));
      return;
    }
    
    // If already loaded and initialized, resolve immediately
    if (window.gapi && window.gapi.auth2) {
      try {
        const auth = window.gapi.auth2.getAuthInstance();
        if (auth) {
          console.log("Google API already initialized");
          resolve();
          return;
        }
      } catch (e) {
        // Auth instance not initialized yet, continue loading
      }
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
        initializeGapiClient(resolve, reject);
      };

      script.onerror = (error) => {
        console.error("Error loading Google API script:", error);
        reject(error);
      };

      document.body.appendChild(script);
    } else if (window.gapi) {
      // Script already loaded
      initializeGapiClient(resolve, reject);
    } else {
      // Script in DOM but not loaded yet
      const checkGapi = setInterval(() => {
        if (window.gapi) {
          clearInterval(checkGapi);
          initializeGapiClient(resolve, reject);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkGapi);
        reject(new Error("Timeout waiting for Google API to load"));
      }, 10000);
    }
  });
};

// Initialize the GAPI client library
const initializeGapiClient = (resolve: () => void, reject: (error: any) => void): void => {
  if (!window.gapi) {
    reject(new Error("Google API not loaded"));
    return;
  }

  const { clientId, clientSecret } = getClientCredentials();

  window.gapi.load('client:auth2', () => {
    try {
      console.log("Initializing Google API client with client ID:", clientId);
      
      // Initialize the client with or without client secret
      const initOptions: any = {
        clientId: clientId,
        scope: SCOPES,
        plugin_name: 'Focus Friend'
      };
      
      window.gapi.client.init(initOptions).then(() => {
        console.log("Google API client initialized successfully");
        resolve();
      }).catch((error: any) => {
        console.error("Error initializing Google API client:", error);
        handleApiError(error, "Google API Initialization Failed");
        reject(error);
      });
    } catch (error) {
      console.error("Exception initializing Google API client:", error);
      reject(error);
    }
  });
};

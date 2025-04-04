
import { getClientCredentials } from './utils';
import { handleApiError } from './utils';
import { SCOPES } from './constants';

// Track initialization status
let isApiLoading = false;
let isApiInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Initialize the Google API client with new Identity Services
export const loadGoogleApi = (): Promise<void> => {
  // If already initialized, return resolved promise
  if (isApiInitialized) {
    return Promise.resolve();
  }
  
  // If already loading, return the existing promise
  if (isApiLoading && initializationPromise) {
    console.log("Google API already loading - returning existing promise");
    return initializationPromise;
  }
  
  // Set loading flag
  isApiLoading = true;
  
  // Create new initialization promise
  initializationPromise = new Promise((resolve, reject) => {
    const { clientId } = getClientCredentials();
    
    // Check if client ID is configured
    if (!clientId) {
      const errorMsg = "Google client ID is not configured. Please set up your OAuth credentials.";
      console.error(errorMsg);
      isApiLoading = false;
      reject(new Error(errorMsg));
      return;
    }

    // Load the gsi (Google Identity Services) client if not already loaded
    if (!document.getElementById('google-identity-script')) {
      console.log("Loading Google Identity Services...");
      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log("Google Identity Services script loaded");
        // Now load regular GAPI for Calendar API calls
        loadGapiClient(resolve, reject);
      };

      script.onerror = (error) => {
        console.error("Error loading Google Identity Services script:", error);
        isApiLoading = false;
        reject(error);
      };

      document.body.appendChild(script);
    } else {
      // Identity script already loaded, continue with GAPI
      loadGapiClient(resolve, reject);
    }
  });
  
  return initializationPromise;
};

// Load GAPI client for API calls (separate from auth)
const loadGapiClient = (resolve: () => void, reject: (error: any) => void): void => {
  if (!document.getElementById('google-api-script')) {
    const script = document.createElement('script');
    script.id = 'google-api-script';
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("Google API script loaded");
      initializeGapiClient(resolve, reject);
    };

    script.onerror = (error) => {
      console.error("Error loading Google API script:", error);
      isApiLoading = false;
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
      isApiLoading = false;
      reject(new Error("Timeout waiting for Google API to load"));
    }, 10000);
  }
};

// Initialize the GAPI client (for Calendar API, not auth)
const initializeGapiClient = (resolve: () => void, reject: (error: any) => void): void => {
  if (!window.gapi) {
    isApiLoading = false;
    reject(new Error("Google API not loaded"));
    return;
  }

  console.log("Initializing Google API client");
  
  window.gapi.load('client', () => {
    try {
      window.gapi.client.init({}).then(() => {
        // Load the Calendar API
        window.gapi.client.load('calendar', 'v3').then(() => {
          console.log("Google Calendar API loaded successfully");
          isApiLoading = false;
          isApiInitialized = true;
          resolve();
        }).catch((error: any) => {
          console.error("Error loading Calendar API:", error);
          handleApiError(error, "Google Calendar API Loading Failed");
          isApiLoading = false;
          reject(error);
        });
      }).catch((error: any) => {
        console.error("Error initializing Google API client:", error);
        handleApiError(error, "Google API Initialization Failed");
        isApiLoading = false;
        reject(error);
      });
    } catch (error) {
      console.error("Exception initializing Google API client:", error);
      isApiLoading = false;
      reject(error);
    }
  });
};

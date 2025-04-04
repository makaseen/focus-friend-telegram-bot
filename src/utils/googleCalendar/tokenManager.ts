
import { TokenResponse } from './types';
import { STORAGE_KEYS } from './constants';
import { handleApiError } from './utils';

/**
 * Manages authentication tokens for Google Calendar API
 */
export class TokenManager {
  token: TokenResponse | null = null;
  
  constructor() {
    this.loadTokenFromStorage();
  }
  
  /**
   * Load saved token from localStorage
   */
  loadTokenFromStorage(): boolean {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (savedToken) {
        const parsedToken = JSON.parse(savedToken) as TokenResponse;
        // Check if token is expired
        if (parsedToken.expiry_date && parsedToken.expiry_date > Date.now()) {
          this.token = parsedToken;
          console.log("Loaded valid token from storage:", !!parsedToken.access_token);
          
          // Store connection status in localStorage
          localStorage.setItem(STORAGE_KEYS.CONNECTION_STATUS, 'true');
          return true;
        } else {
          console.log("Found expired token in storage, removing");
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.CONNECTION_STATUS);
          this.token = null;
        }
      }
    } catch (error) {
      console.error('Failed to parse saved token', error);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.CONNECTION_STATUS);
      this.token = null;
    }
    return false;
  }
  
  /**
   * Process token response from Google OAuth
   */
  handleTokenResponse(response: any): void {
    if (!response || !response.access_token) return;
    
    console.log("Processing token response:", { access_token: "Received" });
    
    // Explicitly set expiry_date if it doesn't exist
    const expiryDate = response.expiry_date || (Date.now() + (response.expires_in * 1000));
    
    this.token = {
      access_token: response.access_token,
      expires_in: response.expires_in,
      token_type: response.token_type || 'Bearer',
      scope: response.scope || '',
      expiry_date: expiryDate
    };
    
    // Store token in localStorage
    localStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(this.token));
    
    // Also store connection status
    localStorage.setItem(STORAGE_KEYS.CONNECTION_STATUS, 'true');
    
    console.log("Token successfully saved to localStorage");
  }
  
  /**
   * Clear token data
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CONNECTION_STATUS);
  }
  
  /**
   * Check if user is authenticated with valid token
   */
  isAuthenticated(): boolean {
    // Always try to refresh token from storage to ensure we have the latest state
    if (!this.token) {
      this.loadTokenFromStorage();
    }
    
    const isAuth = !!this.token && !!this.token.access_token && 
                 !!this.token.expiry_date && this.token.expiry_date > Date.now();
    
    console.log("Authentication check:", isAuth, "Token exists:", !!this.token);
    
    // Update localStorage connection status based on auth check
    localStorage.setItem(STORAGE_KEYS.CONNECTION_STATUS, isAuth ? 'true' : 'false');
    
    return isAuth;
  }
}

export const tokenManager = new TokenManager();

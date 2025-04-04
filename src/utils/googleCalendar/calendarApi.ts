
import { tokenManager } from './tokenManager';
import { eventsHandler } from './events'; 
import { authHandler } from './auth';

/**
 * Main Calendar API facade
 * Provides a simplified interface to the Google Calendar integration
 */
export class GoogleCalendarApi {
  /**
   * Load token from storage
   */
  loadTokenFromStorage() {
    return tokenManager.loadTokenFromStorage();
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return tokenManager.isAuthenticated();
  }
  
  /**
   * Check if API is configured with client ID
   */
  isConfigured() {
    return authHandler.isConfigured();
  }
  
  /**
   * Set client ID for authentication
   */
  setClientId(clientId: string) {
    authHandler.setClientId(clientId);
  }
  
  /**
   * Set client secret for authentication (if needed)
   */
  setClientSecret(clientSecret: string) {
    authHandler.setClientSecret(clientSecret);
  }
  
  /**
   * Initiate sign in flow
   */
  async signIn() {
    return authHandler.signIn();
  }
  
  /**
   * Handle authorization code from redirect
   */
  async handleAuthCode(code: string) {
    return authHandler.handleAuthCode(code);
  }
  
  /**
   * Sign out and clear token
   */
  async signOut() {
    return authHandler.signOut();
  }
  
  /**
   * Get upcoming calendar events
   */
  async getUpcomingEvents(maxResults = 10) {
    return eventsHandler.getUpcomingEvents(maxResults);
  }
}

export const googleCalendarApi = new GoogleCalendarApi();

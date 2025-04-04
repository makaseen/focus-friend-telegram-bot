
import { tokenManager } from './tokenManager';
import { authHandler } from './authHandler';
import { eventsHandler } from './eventsHandler';
import { toast } from "@/hooks/use-toast";

/**
 * Main Google Calendar API wrapper class
 * Acts as a facade for the different specialized handlers
 */
class GoogleCalendarApi {
  /**
   * Check if client ID is set
   */
  isConfigured(): boolean {
    return authHandler.isConfigured();
  }

  /**
   * Update client ID
   */
  setClientId(clientId: string): void {
    authHandler.setClientId(clientId);
  }
  
  /**
   * Update client secret
   */
  setClientSecret(clientSecret: string): void {
    authHandler.setClientSecret(clientSecret);
  }

  /**
   * Load token from storage
   */
  loadTokenFromStorage(): boolean {
    return tokenManager.loadTokenFromStorage();
  }
  
  /**
   * Handle the Google Sign In process
   */
  async signIn(): Promise<boolean> {
    return authHandler.signIn();
  }

  /**
   * Handle authorization code from redirect
   */
  async handleAuthCode(code: string): Promise<boolean> {
    return authHandler.handleAuthCode(code);
  }

  /**
   * Sign out from Google
   */
  async signOut(): Promise<boolean> {
    return authHandler.signOut();
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  }

  /**
   * Fetch upcoming events from calendar
   */
  async getUpcomingEvents(maxResults = 10): Promise<any[]> {
    try {
      return await eventsHandler.getUpcomingEvents(maxResults);
    } catch (error) {
      // This re-throw is important for proper error handling in consumer components
      throw error;
    }
  }
}

// Export a singleton instance
export const googleCalendarApi = new GoogleCalendarApi();

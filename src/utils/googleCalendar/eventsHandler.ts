
import { loadGoogleApi } from './apiLoader';
import { tokenManager } from './tokenManager';
import { handleApiError } from './utils';
import { PRIMARY_CALENDAR_ID, MAX_TIME_RANGE_MS, MAX_RETRY_ATTEMPTS, RETRY_DELAY_MS } from './constants';
import { CalendarEventListParams, CalendarEvent } from './types';

/**
 * Handles fetching events from Google Calendar API
 */
export class EventsHandler {
  /**
   * Fetch upcoming events from calendar with retry logic
   */
  async getUpcomingEvents(maxResults = 10): Promise<CalendarEvent[]> {
    console.log("Getting upcoming events, token status:", !!tokenManager.token?.access_token);
    
    this.validateAuthentication();
    
    try {
      await loadGoogleApi();
      
      // Set the authorization header with the access token
      window.gapi.client.setApiKey('');
      window.gapi.client.setToken({
        access_token: tokenManager.token!.access_token
      });
      
      // Calculate time range - current time to 1 month from now
      const timeRange = this.getTimeRange();
      
      // Try fetching with retries
      return await this.fetchEventsWithRetry(timeRange, maxResults);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      
      // Check for authentication errors and clear token if needed
      if (error instanceof Error && (
          error.message.includes('Not authenticated') || 
          error.message.includes('Invalid Credentials') ||
          error.message.includes('access denied')
        )) {
        console.log("Authentication error detected, clearing token");
        tokenManager.clearToken();
      }
      
      handleApiError(error, "Failed to Load Events");
      throw error; // Re-throw to allow proper handling up the chain
    }
  }
  
  /**
   * Validates user is authenticated, throws error if not
   */
  private validateAuthentication(): void {
    // Always try to load token again if not present
    if (!tokenManager.token || !tokenManager.token.access_token) {
      tokenManager.loadTokenFromStorage();
    }
    
    // Double-check authentication after trying to load token
    if (!tokenManager.isAuthenticated()) {
      console.error('Not authenticated with Google Calendar');
      throw new Error('Not authenticated with Google Calendar');
    }
  }
  
  /**
   * Gets the time range for calendar events
   */
  private getTimeRange(): { now: Date; oneMonthFromNow: Date } {
    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + MAX_TIME_RANGE_MS);
    return { now, oneMonthFromNow };
  }
  
  /**
   * Fetch events with retry logic
   */
  private async fetchEventsWithRetry(
    timeRange: { now: Date; oneMonthFromNow: Date },
    maxResults: number,
    retryCount = 0
  ): Promise<CalendarEvent[]> {
    try {
      return await this.fetchEvents(timeRange, maxResults);
    } catch (error) {
      // If we haven't exceeded retry attempts and it's a 403/401 error, retry
      if (retryCount < MAX_RETRY_ATTEMPTS && this.shouldRetry(error)) {
        console.log(`Retrying calendar fetch (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        
        // Check if we need to refresh the token first
        await this.refreshTokenIfNeeded();
        
        // Recursive retry with incremented counter
        return this.fetchEventsWithRetry(timeRange, maxResults, retryCount + 1);
      }
      
      // Otherwise rethrow
      throw error;
    }
  }
  
  /**
   * Determine if we should retry the request
   */
  private shouldRetry(error: any): boolean {
    // Retry on 403 (permission) or 401 (auth) errors
    if (error && error.result && error.result.error && 
        (error.result.error.code === 403 || error.result.error.code === 401)) {
      return true;
    }
    
    // Also check error message patterns
    if (error instanceof Error && (
      error.message.includes('access denied') ||
      error.message.includes('permission') ||
      error.message.includes('auth') ||
      error.message.includes('credentials')
    )) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Refresh token if needed
   */
  private async refreshTokenIfNeeded(): Promise<void> {
    // In a real implementation, we would refresh the token here
    // For now, just make sure we have the latest token from storage
    tokenManager.loadTokenFromStorage();
  }
  
  /**
   * Fetch events from the Calendar API
   */
  private async fetchEvents(
    timeRange: { now: Date; oneMonthFromNow: Date },
    maxResults: number
  ): Promise<CalendarEvent[]> {
    try {
      // Validate the Google API client is loaded
      if (!window.gapi || !window.gapi.client || !window.gapi.client.calendar) {
        throw new Error('Google Calendar API not properly loaded');
      }
      
      const params: CalendarEventListParams = {
        'calendarId': PRIMARY_CALENDAR_ID,
        'timeMin': timeRange.now.toISOString(),
        'timeMax': timeRange.oneMonthFromNow.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': maxResults,
        'orderBy': 'startTime'
      };
      
      console.log("Fetching calendar events with params:", { 
        calendarId: params.calendarId,
        timeRange: `${params.timeMin} to ${params.timeMax}`
      });
      
      // Add more logging for debugging
      console.log("Using access token:", tokenManager.token?.access_token ? "Present (not showing for security)" : "Missing");
      
      try {
        const response = await window.gapi.client.calendar.events.list(params);
        
        // Add more detailed response logging
        console.log("Calendar API response received:", { 
          status: response.status, 
          resultLength: response.result?.items?.length || 0 
        });
        
        return response.result.items || [];
      } catch (apiError: any) {
        // Enhanced error logging
        console.error("Google Calendar API error details:", apiError);
        
        if (apiError && apiError.result && apiError.result.error) {
          console.error("API Error code:", apiError.result.error.code);
          console.error("API Error message:", apiError.result.error.message);
        }
        
        // Check if this is a scope or permission issue
        if (apiError && 
            ((apiError.result && apiError.result.error && apiError.result.error.code === 403) || 
             (apiError.status === 403))) {
          console.error("Permission denied. This may be due to insufficient calendar scopes.");
          
          // Specific error for scope issues
          throw new Error("Calendar access denied. Please ensure you've granted permission to read your calendar data.");
        } else {
          // Forward other errors to the general error handler
          throw apiError;
        }
      }
    } catch (error: any) {
      console.error("Error in fetchEvents:", error);
      throw error;
    }
  }
}

export const eventsHandler = new EventsHandler();

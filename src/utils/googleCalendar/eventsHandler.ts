
import { loadGoogleApi } from './apiLoader';
import { tokenManager } from './tokenManager';
import { handleApiError } from './utils';
import { PRIMARY_CALENDAR_ID, MAX_TIME_RANGE_MS } from './constants';
import { CalendarEventListParams, CalendarEvent } from './types';

/**
 * Handles fetching events from Google Calendar API
 */
export class EventsHandler {
  /**
   * Fetch upcoming events from calendar
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
      
      return await this.fetchEvents(timeRange, maxResults);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      
      // Check for authentication errors and clear token if needed
      if (error instanceof Error && (
          error.message.includes('Not authenticated') || 
          error.message.includes('Invalid Credentials')
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
   * Fetch events from the Calendar API
   */
  private async fetchEvents(
    timeRange: { now: Date; oneMonthFromNow: Date },
    maxResults: number
  ): Promise<CalendarEvent[]> {
    try {
      const params: CalendarEventListParams = {
        'calendarId': PRIMARY_CALENDAR_ID,
        'timeMin': timeRange.now.toISOString(),
        'timeMax': timeRange.oneMonthFromNow.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': maxResults,
        'orderBy': 'startTime'
      };
      
      const response = await window.gapi.client.calendar.events.list(params);
      
      return response.result.items || [];
    } catch (apiError: any) {
      // Check if this is a scope or permission issue
      if (apiError && apiError.status === 403) {
        console.error("Permission denied. This may be due to insufficient calendar scopes.");
        
        // Specific error for scope issues
        throw new Error("Calendar access denied. Please ensure you've granted permission to read your calendar data.");
      } else {
        // Forward other errors to the general error handler
        throw apiError;
      }
    }
  }
}

export const eventsHandler = new EventsHandler();

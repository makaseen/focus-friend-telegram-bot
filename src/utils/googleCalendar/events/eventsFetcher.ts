
import { createListParams } from './utils';
import { CalendarEvent } from '../types';

/**
 * Handles the actual API calls to fetch events
 */
export class EventsFetcher {
  /**
   * Fetch events from the Calendar API
   */
  async fetchEvents(
    timeRange: { now: Date; oneMonthFromNow: Date },
    maxResults: number
  ): Promise<CalendarEvent[]> {
    try {
      // Validate the Google API client is loaded
      if (!window.gapi || !window.gapi.client || !window.gapi.client.calendar) {
        throw new Error('Google Calendar API not properly loaded');
      }
      
      const params = createListParams(timeRange, maxResults);
      
      console.log("Fetching calendar events with params:", { 
        calendarId: params.calendarId,
        timeRange: `${params.timeMin} to ${params.timeMax}`
      });
      
      // Add more logging for debugging
      console.log("Using access token:", "Present (not showing for security)");
      
      try {
        const response = await window.gapi.client.calendar.events.list(params);
        
        // Add more detailed response logging
        console.log("Calendar API response received:", { 
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
             (typeof apiError.status === 'number' && apiError.status === 403))) {
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

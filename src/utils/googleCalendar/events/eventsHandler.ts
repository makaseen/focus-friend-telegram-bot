import { loadGoogleApi } from '../apiLoader';
import { tokenManager } from '../tokenManager';
import { handleApiError } from '../utils';
import { MAX_RETRY_ATTEMPTS, RETRY_DELAY_MS } from '../constants';
import { CalendarEvent } from '../types';
import { validateAuthentication, getTimeRange, createListParams, shouldRetry } from './utils';
import { EventsFetcher } from './eventsFetcher';

/**
 * Handles fetching events from Google Calendar API
 */
export class EventsHandler {
  private eventsFetcher = new EventsFetcher();
  
  // Track last refresh to prevent too many calls
  private lastRefresh: number = 0;
  private minRefreshInterval: number = 15000; // Increased from 5s to 15s
  private isRefreshing: boolean = false; // Add a lock to prevent concurrent refreshes
  
  // Keep track of last events to prevent unnecessary UI updates
  private lastEvents: CalendarEvent[] = [];
  
  /**
   * Fetch upcoming events from calendar with retry logic
   */
  async getUpcomingEvents(maxResults = 10): Promise<CalendarEvent[]> {
    console.log("Getting upcoming events, token status:", !!tokenManager.token?.access_token);
    
    // If already refreshing, return the last events or empty array
    if (this.isRefreshing) {
      console.log(`Refresh already in progress. Returning cached events.`);
      return this.lastEvents;
    }
    
    // Throttle refreshes to prevent too many calls
    const now = Date.now();
    if (now - this.lastRefresh < this.minRefreshInterval) {
      console.log(`Refresh throttled. Last refresh was ${(now - this.lastRefresh) / 1000}s ago.`);
      
      // If we have cached events, return them instead of making new API calls
      if (this.lastEvents.length > 0) {
        console.log("Returning cached events from previous fetch");
        return this.lastEvents;
      }
      
      // If we have a valid token, just validate without API calls
      if (tokenManager.isAuthenticated()) {
        try {
          // Just re-validate without making the API call
          validateAuthentication();
        } catch (error) {
          console.error("Auth validation failed during throttled refresh:", error);
          throw error;
        }
      }
    }
    
    try {
      // Set refreshing lock
      this.isRefreshing = true;
      this.lastRefresh = now;
      
      // Validate authentication - will throw if not authenticated
      validateAuthentication();
      
      await loadGoogleApi();
      
      // Set the authorization header with the access token
      window.gapi.client.setApiKey('');
      window.gapi.client.setToken({
        access_token: tokenManager.token!.access_token
      });
      
      // Calculate time range - current time to 1 month from now
      const timeRange = getTimeRange();
      
      // Try fetching with retries
      const events = await this.fetchEventsWithRetry(timeRange, maxResults);
      
      // Cache the successful result
      this.lastEvents = events;
      
      return events;
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
        this.lastEvents = [];
      }
      
      handleApiError(error, "Failed to Load Events");
      throw error; // Re-throw to allow proper handling up the chain
    } finally {
      // Release refreshing lock
      setTimeout(() => {
        this.isRefreshing = false;
      }, 500); // Short delay to prevent race conditions
    }
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
      return await this.eventsFetcher.fetchEvents(timeRange, maxResults);
    } catch (error) {
      // If we haven't exceeded retry attempts and it's a 403/401 error, retry
      if (retryCount < MAX_RETRY_ATTEMPTS && shouldRetry(error)) {
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
   * Refresh token if needed
   */
  private async refreshTokenIfNeeded(): Promise<void> {
    // In a real implementation, we would refresh the token here
    // For now, just make sure we have the latest token from storage
    tokenManager.loadTokenFromStorage();
  }
  
  /**
   * Clear the cached events to force a refresh on next call
   */
  clearCache(): void {
    this.lastEvents = [];
    this.lastRefresh = 0;
  }
}

export const eventsHandler = new EventsHandler();

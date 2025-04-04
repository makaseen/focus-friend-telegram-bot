
import { tokenManager } from '../tokenManager';
import { CalendarEventListParams } from './types';
import { PRIMARY_CALENDAR_ID, MAX_TIME_RANGE_MS } from '../constants';

/**
 * Gets the default time range for calendar events (now to 1 month from now)
 */
export function getTimeRange(): { now: Date; oneMonthFromNow: Date } {
  const now = new Date();
  const oneMonthFromNow = new Date(now.getTime() + MAX_TIME_RANGE_MS);
  return { now, oneMonthFromNow };
}

/**
 * Creates the default parameters for events.list API call
 */
export function createListParams(
  timeRange: { now: Date; oneMonthFromNow: Date },
  maxResults: number
): CalendarEventListParams {
  return {
    'calendarId': PRIMARY_CALENDAR_ID,
    'timeMin': timeRange.now.toISOString(),
    'timeMax': timeRange.oneMonthFromNow.toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': maxResults,
    'orderBy': 'startTime'
  };
}

/**
 * Validates that the user is authenticated, throws error if not
 */
export function validateAuthentication(): void {
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
 * Determine if a request should be retried based on error
 */
export function shouldRetry(error: any): boolean {
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

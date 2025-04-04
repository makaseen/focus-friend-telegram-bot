
// Calendar API constants

// OAuth scopes needed for calendar read functionality
// Adding more specific scope declarations to ensure we have all necessary permissions
export const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly';

// Storage keys for persisting auth data
export const STORAGE_KEYS = {
  TOKEN: 'googleCalendarToken',
  CLIENT_ID: 'googleCalendarClientId',
  CLIENT_SECRET: 'googleCalendarClientSecret',
  CONNECTION_STATUS: 'googleCalendarConnected',
  LAST_REFRESH: 'googleCalendarLastRefresh'
};

// Calendar IDs
export const PRIMARY_CALENDAR_ID = 'primary';

// API endpoints
export const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

// Time constraints
export const MAX_TIME_RANGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// API request parameters
export const MAX_RETRY_ATTEMPTS = 3; // Increased from 2 to 3
export const RETRY_DELAY_MS = 2000; // Increased from 1 second to 2 seconds

// Throttling parameters
export const MIN_REFRESH_INTERVAL_MS = 60000; // Minimum 1 minute between refreshes

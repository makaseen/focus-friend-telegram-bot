
// Calendar API constants

// OAuth scopes needed for calendar read functionality
export const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly';

// Storage keys for persisting auth data
export const STORAGE_KEYS = {
  TOKEN: 'googleCalendarToken',
  CLIENT_ID: 'googleCalendarClientId',
  CLIENT_SECRET: 'googleCalendarClientSecret',
  CONNECTION_STATUS: 'googleCalendarConnected'
};

// Calendar IDs
export const PRIMARY_CALENDAR_ID = 'primary';

// API endpoints
export const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

// Time constraints
export const MAX_TIME_RANGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

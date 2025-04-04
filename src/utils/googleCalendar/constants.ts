
// Google Calendar API scopes needed for our application
// Explicitly requesting read-only access to Calendar
export const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly';

// Default calendar ID for primary calendar
export const PRIMARY_CALENDAR_ID = 'primary';

// LocalStorage keys
export const STORAGE_KEYS = {
  TOKEN: 'googleCalendarToken',
  CLIENT_ID: 'googleCalendarClientId',
  CLIENT_SECRET: 'googleCalendarClientSecret'
};

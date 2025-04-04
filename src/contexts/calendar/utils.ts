
import { STORAGE_KEYS } from "@/utils/googleCalendar/constants";
import { googleCalendarApi } from "@/utils/googleCalendar";

// Check if calendar has been previously connected
export const getSavedConnectionStatus = (): boolean => {
  try {
    // First, check if token is valid
    if (googleCalendarApi.isAuthenticated()) {
      return true;
    }
    
    // If no valid token but we have a saved connection status, use that
    const saved = localStorage.getItem(STORAGE_KEYS.CONNECTION_STATUS);
    if (saved === 'true') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking saved connection status:', error);
    return false;
  }
};

// Save calendar connection status
export const saveConnectionStatus = (connected: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONNECTION_STATUS, connected ? 'true' : 'false');
  } catch (error) {
    console.error('Error saving connection status:', error);
  }
};

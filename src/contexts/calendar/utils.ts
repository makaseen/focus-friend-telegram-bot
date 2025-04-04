
import { googleCalendarApi } from "@/utils/googleCalendar";

// Check for saved connection status in localStorage
export const getSavedConnectionStatus = (): boolean => {
  // Check if there's actually a valid token
  return googleCalendarApi.isAuthenticated();
};

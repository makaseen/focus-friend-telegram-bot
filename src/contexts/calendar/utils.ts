
import { googleCalendarApi } from "@/utils/googleCalendar";

// Check for saved connection status in localStorage
export const getSavedConnectionStatus = (): boolean => {
  // Make sure to reload the token from storage first to ensure we have the latest state
  googleCalendarApi.loadTokenFromStorage();
  
  // Then check if authentication is valid
  const isAuthenticated = googleCalendarApi.isAuthenticated();
  console.log("Checking saved connection status:", isAuthenticated);
  return isAuthenticated;
};

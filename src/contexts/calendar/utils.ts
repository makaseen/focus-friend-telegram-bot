
import { googleCalendarApi } from "@/utils/googleCalendar";

// Check for saved connection status in localStorage
export const getSavedConnectionStatus = (): boolean => {
  // Check if there's actually a valid token by calling the API's authentication check
  const isAuthenticated = googleCalendarApi.isAuthenticated();
  console.log("Checking saved connection status:", isAuthenticated);
  return isAuthenticated;
};

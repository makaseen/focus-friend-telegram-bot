
import { createContext, useState, useEffect, ReactNode } from 'react';
import { googleCalendarApi } from '@/utils/googleCalendar';
import { getSavedConnectionStatus, saveConnectionStatus } from './utils';
import { CalendarContextType, CalendarProviderProps } from './types';
import { toast } from '@/hooks/use-toast';

export const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [calendarConnected, setCalendarConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [clientId, setClientId] = useState<string>('');
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if calendar API is configured
  const isConfigured = googleCalendarApi.isConfigured();

  // Check connection status on mount and when URL changes (for auth callback)
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        // Force a token refresh from storage first
        googleCalendarApi.loadTokenFromStorage();
        
        // Check if we have previously connected status
        const connected = getSavedConnectionStatus();
        console.log("Calendar connection status check:", connected);
        setCalendarConnected(connected);
        
        // If connected, try to load events
        if (connected) {
          refreshEvents();
        }
      } catch (err) {
        console.error("Error checking connection status:", err);
      }
    };
    
    // Load client ID from storage
    const savedClientId = localStorage.getItem('googleCalendarClientId') || '';
    setClientId(savedClientId);
    
    // Set up listeners for URL changes
    const setupUrlChangeListeners = () => {
      // Check on mount
      checkConnectionStatus();
      
      // Also check when URL changes (could be returning from auth)
      window.addEventListener('popstate', checkConnectionStatus);
      
      // Check on location hash change (for OAuth2 redirects)
      window.addEventListener('hashchange', handleHashChange);
      
      return () => {
        window.removeEventListener('popstate', checkConnectionStatus);
        window.removeEventListener('hashchange', handleHashChange);
      };
    };
    
    // Handler for hash changes
    const handleHashChange = () => {
      console.log("Hash changed, checking connection status");
      checkConnectionStatus();
    };
    
    return setupUrlChangeListeners();
  }, []);

  // Connect to Google Calendar
  const connectCalendar = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Attempt to sign in using the Google Calendar API
      const success = await googleCalendarApi.signIn();
      
      if (success) {
        setCalendarConnected(true);
        saveConnectionStatus(true);
        // Fetch events after successful connection
        await refreshEvents();
      } else {
        setCalendarConnected(false);
        saveConnectionStatus(false);
        setError('Failed to connect to Google Calendar.');
      }
    } catch (err) {
      console.error('Error connecting to calendar:', err);
      setError('Failed to connect to Google Calendar. Please check your client ID and try again.');
      setCalendarConnected(false);
      saveConnectionStatus(false);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from Google Calendar
  const disconnectCalendar = () => {
    setIsLoading(true);
    
    try {
      // Clear storage
      googleCalendarApi.signOut();
      setCalendarConnected(false);
      saveConnectionStatus(false);
      setEvents([]);
      setError(null);
    } catch (err) {
      console.error('Error disconnecting from calendar:', err);
      setError('Failed to disconnect from Google Calendar.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update client ID
  const updateClientId = (newClientId: string) => {
    googleCalendarApi.setClientId(newClientId);
    setClientId(newClientId);
  };

  // Update client secret
  const updateClientSecret = (clientSecret: string) => {
    googleCalendarApi.setClientSecret(clientSecret);
  };

  // Fetch calendar events
  const refreshEvents = async (): Promise<void> => {
    // Force refresh token from storage before checking
    googleCalendarApi.loadTokenFromStorage();
    
    // Check if authenticated before proceeding
    if (!googleCalendarApi.isAuthenticated()) {
      console.warn('Attempted to fetch events but calendar is not connected.');
      setCalendarConnected(false);
      saveConnectionStatus(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching calendar events...");
      const calendarEvents = await googleCalendarApi.getUpcomingEvents(10);
      console.log("Received events:", calendarEvents.length);
      setEvents(calendarEvents);
      
      // If we successfully got events, ensure connection state is true
      setCalendarConnected(true);
      saveConnectionStatus(true);
    } catch (err) {
      console.error('Error fetching events:', err);
      toast({
        title: "Calendar Error",
        description: "Failed to fetch calendar events. Please reconnect your calendar.",
        variant: "destructive"
      });
      // If we get auth errors, reset the connection state
      if (err instanceof Error && err.message.includes('Not authenticated')) {
        setCalendarConnected(false);
        saveConnectionStatus(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value: CalendarContextType = {
    calendarConnected,
    isConnecting,
    isConfigured,
    connectCalendar,
    disconnectCalendar,
    updateClientId,
    updateClientSecret,
    events,
    refreshEvents
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

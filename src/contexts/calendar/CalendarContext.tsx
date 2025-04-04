
import { createContext, useState, useEffect, ReactNode } from 'react';
import { googleCalendarApi } from '@/utils/googleCalendar';
import { getSavedConnectionStatus } from './utils';
import { CalendarContextType } from './types';

export const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

type CalendarProviderProps = {
  children: ReactNode;
};

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [calendarConnected, setCalendarConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [clientId, setClientId] = useState<string>('');
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if calendar API is configured
  const isConfigured = googleCalendarApi.isConfigured();

  useEffect(() => {
    // Check if we have previously connected status
    const connected = getSavedConnectionStatus();
    setCalendarConnected(connected);
    
    // Load client ID from storage if available
    const savedClientId = localStorage.getItem('googleCalendarClientId') || '';
    setClientId(savedClientId);
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
        // Fetch events after successful connection
        await refreshEvents();
      } else {
        setCalendarConnected(false);
        setError('Failed to connect to Google Calendar.');
      }
    } catch (err) {
      console.error('Error connecting to calendar:', err);
      setError('Failed to connect to Google Calendar. Please check your client ID and try again.');
      setCalendarConnected(false);
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
    if (!calendarConnected) {
      setError('Calendar is not connected.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const calendarEvents = await googleCalendarApi.getUpcomingEvents(10);
      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch calendar events.');
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


import { createContext, useState, useEffect, ReactNode } from 'react';
import { googleCalendarApi } from '@/utils/googleCalendar';
import { getSavedConnectionStatus } from './utils';
import { CalendarContextType } from './types';

export const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

type CalendarProviderProps = {
  children: ReactNode;
};

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [clientId, setClientId] = useState<string>('');
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have previously connected status
    const connected = getSavedConnectionStatus();
    setIsConnected(connected);
    
    // Load client ID from storage if available
    const savedClientId = localStorage.getItem('googleCalendarClientId') || '';
    setClientId(savedClientId);
  }, []);

  // Connect to Google Calendar
  const connectCalendar = async (newClientId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Save client ID
      localStorage.setItem('googleCalendarClientId', newClientId);
      setClientId(newClientId);
      
      // Get authorization URL
      const authUrl = await googleCalendarApi.getAuthUrl(newClientId);
      
      // Redirect to auth URL
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error connecting to calendar:', err);
      setError('Failed to connect to Google Calendar. Please check your client ID and try again.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect from Google Calendar
  const disconnectCalendar = () => {
    setIsLoading(true);
    
    try {
      // Clear storage
      googleCalendarApi.signOut();
      setIsConnected(false);
      setEvents([]);
      setError(null);
    } catch (err) {
      console.error('Error disconnecting from calendar:', err);
      setError('Failed to disconnect from Google Calendar.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch calendar events
  const fetchEvents = async (startDate?: Date, endDate?: Date) => {
    if (!isConnected) {
      setError('Calendar is not connected.');
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const calendarEvents = await googleCalendarApi.listEvents(startDate, endDate);
      setEvents(calendarEvents);
      return calendarEvents;
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch calendar events.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isConnected,
    clientId,
    events,
    isLoading,
    error,
    connectCalendar,
    disconnectCalendar,
    fetchEvents
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

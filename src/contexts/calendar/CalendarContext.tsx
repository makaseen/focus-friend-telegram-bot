
import React, { createContext, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { googleCalendarApi } from "@/utils/googleCalendar";
import { CalendarContextType, CalendarProviderProps } from './types';
import { getSavedConnectionStatus } from './utils';

// Create the context with undefined as default value
export const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: CalendarProviderProps) {
  const [calendarConnected, setCalendarConnected] = useState(getSavedConnectionStatus());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(googleCalendarApi.isConfigured());
  const [events, setEvents] = useState<any[]>([]);

  // Initialize and check authentication state
  useEffect(() => {
    const checkAuthStatus = async () => {
      const isAuth = googleCalendarApi.isAuthenticated();
      setCalendarConnected(isAuth);
      setIsConfigured(googleCalendarApi.isConfigured());
      
      if (isAuth) {
        refreshEvents();
      }
    };
    
    checkAuthStatus();
    
    console.log(`Calendar connection status: ${calendarConnected}`);
    console.log(`Calendar configured status: ${isConfigured}`);
  }, []);

  const updateClientId = (clientId: string) => {
    if (clientId && clientId.trim() !== '') {
      googleCalendarApi.setClientId(clientId.trim());
      setIsConfigured(true);
      toast({
        title: "Client ID Updated",
        description: "Google Calendar Client ID has been updated.",
      });
    } else {
      toast({
        title: "Invalid Client ID",
        description: "Please provide a valid Google OAuth client ID.",
        variant: "destructive",
      });
    }
  };
  
  const updateClientSecret = (clientSecret: string) => {
    googleCalendarApi.setClientSecret(clientSecret);
    toast({
      title: "Client Secret Updated",
      description: "Google Calendar Client Secret has been updated.",
    });
  };

  const connectCalendar = async () => {
    if (calendarConnected || isConnecting) return;
    
    if (!isConfigured) {
      toast({
        title: "Configuration Required",
        description: "Please set your Google OAuth client ID first.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Calendar connection initiated");
    setIsConnecting(true);
    
    try {
      const success = await googleCalendarApi.signIn();
      
      if (success) {
        setCalendarConnected(true);
        toast({
          title: "Calendar Connected",
          description: "Your Google Calendar has been successfully connected.",
        });
        
        // Fetch events after successful connection
        await refreshEvents();
      } else {
        // Failed to connect - the toast is already shown in the API
        console.log("Connection returned false");
      }
    } catch (error) {
      console.error("Calendar connection failed with exception:", error);
      
      toast({
        title: "Connection Failed",
        description: "Could not connect to Google Calendar. Please check your client ID.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectCalendar = async () => {
    if (!calendarConnected) return;
    
    console.log("Calendar disconnection initiated");
    
    try {
      await googleCalendarApi.signOut();
      
      setCalendarConnected(false);
      setEvents([]);
      
      toast({
        title: "Calendar Disconnected",
        description: "Your Google Calendar has been disconnected.",
      });
    } catch (error) {
      console.error("Calendar disconnection failed:", error);
      
      toast({
        title: "Disconnection Failed",
        description: "Could not disconnect from Google Calendar.",
        variant: "destructive",
      });
    }
  };
  
  const refreshEvents = async () => {
    if (!calendarConnected) return;
    
    try {
      const upcomingEvents = await googleCalendarApi.getUpcomingEvents();
      setEvents(upcomingEvents);
    } catch (error) {
      console.error("Failed to refresh calendar events:", error);
    }
  };

  // Return the provider
  return (
    <CalendarContext.Provider value={{ 
      calendarConnected, 
      isConnecting,
      isConfigured,
      connectCalendar,
      disconnectCalendar,
      updateClientId,
      updateClientSecret,
      events,
      refreshEvents
    }}>
      {children}
    </CalendarContext.Provider>
  );
}

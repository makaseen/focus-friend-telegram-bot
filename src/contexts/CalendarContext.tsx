
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { googleCalendarApi } from "@/utils/googleCalendarApi";

interface CalendarContextType {
  calendarConnected: boolean;
  isConnecting: boolean;
  connectCalendar: () => void;
  disconnectCalendar: () => void;
  events: any[];
  refreshEvents: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

// Check for saved connection status in localStorage
const getSavedConnectionStatus = (): boolean => {
  // Check if there's actually a valid token
  return googleCalendarApi.isAuthenticated();
};

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [calendarConnected, setCalendarConnected] = useState(getSavedConnectionStatus());
  const [isConnecting, setIsConnecting] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  // Initialize and check authentication state
  useEffect(() => {
    const checkAuthStatus = async () => {
      const isAuth = googleCalendarApi.isAuthenticated();
      setCalendarConnected(isAuth);
      
      if (isAuth) {
        refreshEvents();
      }
    };
    
    checkAuthStatus();
    
    console.log(`Calendar connection status: ${calendarConnected}`);
  }, []);

  const connectCalendar = async () => {
    if (calendarConnected || isConnecting) return;
    
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
      }
      
      setIsConnecting(false);
    } catch (error) {
      setIsConnecting(false);
      console.error("Calendar connection failed:", error);
      
      toast({
        title: "Connection Failed",
        description: "Could not connect to Google Calendar.",
        variant: "destructive",
      });
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

  return (
    <CalendarContext.Provider value={{ 
      calendarConnected, 
      isConnecting, 
      connectCalendar,
      disconnectCalendar,
      events,
      refreshEvents
    }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}

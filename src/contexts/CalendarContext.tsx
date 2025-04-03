
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

interface CalendarContextType {
  calendarConnected: boolean;
  isConnecting: boolean;
  connectCalendar: () => void;
  disconnectCalendar: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

// Check for saved connection status in localStorage
const getSavedConnectionStatus = (): boolean => {
  const saved = localStorage.getItem('calendarConnected');
  return saved === 'true';
};

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [calendarConnected, setCalendarConnected] = useState(getSavedConnectionStatus());
  const [isConnecting, setIsConnecting] = useState(false);

  // Save connection status to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('calendarConnected', calendarConnected.toString());
    console.log(`Calendar connection status saved: ${calendarConnected}`);
  }, [calendarConnected]);

  const connectCalendar = () => {
    if (calendarConnected || isConnecting) return;
    
    console.log("Calendar connection initiated");
    setIsConnecting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsConnecting(false);
      setCalendarConnected(true);
      toast({
        title: "Calendar Connected",
        description: "Your Google Calendar has been successfully connected.",
      });
    }, 2000);
  };

  const disconnectCalendar = () => {
    if (!calendarConnected) return;
    
    console.log("Calendar disconnection initiated");
    
    // Immediate disconnection
    setCalendarConnected(false);
    toast({
      title: "Calendar Disconnected",
      description: "Your Google Calendar has been disconnected.",
    });
  };

  return (
    <CalendarContext.Provider value={{ 
      calendarConnected, 
      isConnecting, 
      connectCalendar,
      disconnectCalendar 
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


import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";

interface CalendarContextType {
  calendarConnected: boolean;
  isConnecting: boolean;
  connectCalendar: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

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

  return (
    <CalendarContext.Provider value={{ calendarConnected, isConnecting, connectCalendar }}>
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

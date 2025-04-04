
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { googleCalendarApi } from "@/utils/googleCalendarApi";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon } from "lucide-react";

interface CalendarContextType {
  calendarConnected: boolean;
  isConnecting: boolean;
  isConfigured: boolean;
  connectCalendar: () => void;
  disconnectCalendar: () => void;
  updateClientId: (clientId: string) => void;
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

  return (
    <CalendarContext.Provider value={{ 
      calendarConnected, 
      isConnecting,
      isConfigured,
      connectCalendar,
      disconnectCalendar,
      updateClientId,
      events,
      refreshEvents
    }}>
      {children}
    </CalendarContext.Provider>
  );
}

// Changed to a named function declaration instead of an arrow function for better Fast Refresh compatibility
export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}

export function CalendarConfigAlert() {
  const { isConfigured, updateClientId } = useCalendar();
  const [clientId, setClientId] = useState('');
  const [showInput, setShowInput] = useState(false);

  if (isConfigured) return null;

  return (
    <Alert variant="destructive" className="my-4">
      <CalendarIcon className="h-4 w-4" />
      <AlertTitle>Google Calendar Setup Needed</AlertTitle>
      <AlertDescription>
        <p className="mb-2">You need to set up Google OAuth credentials to use the Calendar feature.</p>
        <p className="mb-2 text-xs">Error: Unable to authenticate with Google. Please provide a valid client ID.</p>
        {!showInput ? (
          <button 
            onClick={() => setShowInput(true)}
            className="text-xs underline hover:text-gray-700"
          >
            Configure now
          </button>
        ) : (
          <div className="mt-2">
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded mb-2"
              placeholder="Enter your Google OAuth client ID"
            />
            <div className="flex space-x-2">
              <button 
                onClick={() => updateClientId(clientId)}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                disabled={!clientId}
              >
                Save
              </button>
              <button 
                onClick={() => setShowInput(false)}
                className="text-xs bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

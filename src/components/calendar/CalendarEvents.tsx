
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CalendarIcon, RefreshCw } from 'lucide-react';

interface CalendarEventsProps {
  events: any[];
  refreshEvents: () => Promise<void>;
}

const CalendarEvents = ({ events, refreshEvents }: CalendarEventsProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  if (events.length === 0) {
    return null;
  }
  
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      await refreshEvents();
    } catch (error) {
      console.error("Error refreshing events:", error);
    } finally {
      // Add a minimum visual feedback time
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };
  
  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <h3 className="font-medium mb-2 flex items-center">
        <CalendarIcon className="h-4 w-4 mr-2 text-focus" />
        Your Upcoming Events
      </h3>
      <ul className="space-y-2">
        {events.slice(0, 3).map((event, index) => {
          const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
          return (
            <li key={event.id || index} className="text-sm">
              <span className="font-medium">{event.summary}</span>
              <br />
              <span className="text-muted-foreground">
                {start.toLocaleDateString()} {event.start.dateTime ? `at ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'All day'}
              </span>
            </li>
          );
        })}
      </ul>
      <Button 
        variant="link" 
        size="sm" 
        className="mt-2 p-0 h-auto text-focus flex items-center"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <>
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Refreshing...
          </>
        ) : (
          <>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh events
          </>
        )}
      </Button>
    </div>
  );
};

export default CalendarEvents;

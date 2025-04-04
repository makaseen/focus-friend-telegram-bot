
import React from 'react';
import { Button } from "@/components/ui/button";
import { BotIcon, CalendarIcon } from 'lucide-react';

interface HeroActionsProps {
  onGetStarted: () => void;
  onConnectCalendar: () => void;
  onDisconnectCalendar: () => void;
  calendarConnected: boolean;
  isConnecting: boolean;
}

const HeroActions = ({ 
  onGetStarted, 
  onConnectCalendar, 
  onDisconnectCalendar, 
  calendarConnected, 
  isConnecting 
}: HeroActionsProps) => {
  return (
    <div className="flex flex-col gap-2 min-[400px]:flex-row">
      <Button 
        className="bg-focus hover:bg-focus-dark" 
        size="lg"
        onClick={onGetStarted}
        aria-label="Get Started with Focus Friend"
      >
        <BotIcon className="mr-2 h-4 w-4" />
        Get Started
      </Button>
      {calendarConnected ? (
        <Button 
          variant="outline" 
          size="lg"
          onClick={onDisconnectCalendar}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          Disconnect Calendar
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="lg"
          onClick={onConnectCalendar}
          disabled={isConnecting}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Google Calendar"}
        </Button>
      )}
    </div>
  );
};

export default HeroActions;

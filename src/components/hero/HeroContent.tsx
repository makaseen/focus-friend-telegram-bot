
import React from 'react';
import { CalendarConfigAlert } from "@/contexts/CalendarContext";
import HeroActions from "@/components/hero/HeroActions";
import CalendarEvents from "@/components/calendar/CalendarEvents";

interface HeroContentProps {
  onGetStarted: () => void;
  onConnectCalendar: () => void;
  onDisconnectCalendar: () => void;
  calendarConnected: boolean;
  isConnecting: boolean;
  events: any[];
  refreshEvents: () => Promise<void>;
}

const HeroContent = ({ 
  onGetStarted, 
  onConnectCalendar, 
  onDisconnectCalendar, 
  calendarConnected, 
  isConnecting,
  events,
  refreshEvents
}: HeroContentProps) => {
  return (
    <div className="flex flex-col justify-center space-y-4">
      <div className="inline-block rounded-lg bg-focus/10 px-3 py-1 text-sm text-focus mb-2">
        Introducing Focus Friend
      </div>
      <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
        Your ADHD Mentor in Telegram
      </h1>
      <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
        A personal bot that helps you manage ADHD, stay on track with your schedule, 
        and provides timely recommendations tailored just for you.
      </p>
      
      {/* Show configuration alert if needed */}
      <CalendarConfigAlert />
      
      <HeroActions 
        onGetStarted={onGetStarted}
        onConnectCalendar={onConnectCalendar}
        onDisconnectCalendar={onDisconnectCalendar}
        calendarConnected={calendarConnected}
        isConnecting={isConnecting}
      />
      
      {calendarConnected && events.length > 0 && (
        <CalendarEvents 
          events={events}
          refreshEvents={refreshEvents}
        />
      )}
    </div>
  );
};

export default HeroContent;

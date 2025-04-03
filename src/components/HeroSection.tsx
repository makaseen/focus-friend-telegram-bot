
import React, { useState } from 'react';
import { Modal } from "@/components/ui/modal";
import { useCalendar } from "@/contexts/CalendarContext";
import { CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/chat/ChatInterface";
import HeroActions from "@/components/hero/HeroActions";
import CalendarEvents from "@/components/calendar/CalendarEvents";

const HeroSection = () => {
  const [showBotModal, setShowBotModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const { calendarConnected, isConnecting, connectCalendar, disconnectCalendar, events, refreshEvents } = useCalendar();

  const handleGetStarted = () => {
    console.log("Get Started button clicked");
    setShowBotModal(true);
  };

  const handleConnectCalendar = () => {
    console.log("Connect Google Calendar button clicked");
    setShowCalendarModal(true);
  };

  const initiateCalendarConnection = () => {
    connectCalendar();
  };

  return (
    <section className="py-12 md:py-24 lg:py-32 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
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
            
            <HeroActions 
              onGetStarted={handleGetStarted}
              onConnectCalendar={handleConnectCalendar}
              onDisconnectCalendar={disconnectCalendar}
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
          
          <div className="flex items-center justify-center">
            <ChatInterface />
          </div>
        </div>
      </div>

      <Modal
        isOpen={showBotModal}
        onClose={() => setShowBotModal(false)}
        title="Setup Telegram Bot"
      >
        <p>To set up your Focus Friend bot on Telegram:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-2 mb-4">
          <li>Open Telegram app on your device</li>
          <li>Search for @FocusFriendBot in the search bar</li>
          <li>Start a conversation with the bot by clicking "Start"</li>
          <li>Follow the setup instructions provided by the bot</li>
        </ol>
      </Modal>

      <Modal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title="Connect Google Calendar"
      >
        <p>To connect your Google Calendar:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-2 mb-4">
          <li>We'll need access to your Google Calendar</li>
          <li>Your events will sync with Focus Friend</li>
          <li>You'll receive timely reminders and schedule assistance</li>
          <li>Your data is kept private and secure</li>
        </ol>
        <Button 
          className="w-full mt-4 bg-focus hover:bg-focus-dark"
          onClick={initiateCalendarConnection}
          disabled={isConnecting || calendarConnected}
        >
          {isConnecting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Connecting...
            </>
          ) : calendarConnected ? (
            "Already Connected"
          ) : (
            <>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Connect Calendar
            </>
          )}
        </Button>
      </Modal>
    </section>
  );
};

export default HeroSection;

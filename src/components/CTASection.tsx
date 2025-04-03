
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BotIcon, CalendarCheck } from 'lucide-react';
import { Modal } from "@/components/ui/modal";
import { toast } from "@/hooks/use-toast";

const CTASection = () => {
  const [showBotModal, setShowBotModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);

  const handleSetupBot = () => {
    console.log("Setup Telegram Bot button clicked");
    setShowBotModal(true);
  };

  const handleConnectCalendar = () => {
    console.log("Connect Google Calendar button clicked");
    setShowCalendarModal(true);
  };

  const initiateCalendarConnection = () => {
    console.log("Calendar connection initiated");
    setIsConnecting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsConnecting(false);
      setShowCalendarModal(false);
      setCalendarConnected(true);
      toast({
        title: "Calendar Connected",
        description: "Your Google Calendar has been successfully connected.",
      });
    }, 2000);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-focus to-calm">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Focus Better?</h2>
          <p className="mb-8 text-white/90 text-lg">
            Start using Focus Friend today and transform how you manage your ADHD symptoms and daily schedule.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="font-medium"
              onClick={handleSetupBot}
            >
              <BotIcon className="mr-2 h-5 w-5" />
              Setup Telegram Bot
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-white hover:bg-white/10"
              onClick={handleConnectCalendar}
              disabled={calendarConnected}
            >
              <CalendarCheck className="mr-2 h-5 w-5" />
              {calendarConnected ? "Calendar Connected" : "Connect Google Calendar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
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
              <CalendarCheck className="mr-2 h-4 w-4" />
              Connect Calendar
            </>
          )}
        </Button>
      </Modal>
    </section>
  );
};

export default CTASection;

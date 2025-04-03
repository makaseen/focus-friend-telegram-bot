
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BrainCog, Calendar, Bot } from 'lucide-react';
import { Modal } from "@/components/ui/modal";
import { useCalendar } from "@/contexts/CalendarContext";

const Header = () => {
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showBotModal, setShowBotModal] = useState(false);
  const { 
    calendarConnected, 
    isConnecting, 
    isConfigured,
    connectCalendar, 
    disconnectCalendar 
  } = useCalendar();

  const handleConnectCalendar = () => {
    console.log("Connect Calendar button clicked");
    setShowCalendarModal(true);
  };

  const handleSetupBot = () => {
    console.log("Setup Bot button clicked");
    setShowBotModal(true);
  };

  const initiateCalendarConnection = () => {
    connectCalendar();
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm border-b bg-background/80">
      <div className="container flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <BrainCog className="h-6 w-6 text-focus" />
          <h1 className="text-xl font-bold">Focus Friend</h1>
        </div>
        
        <div className="flex gap-2">
          {calendarConnected ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:inline-flex"
              onClick={disconnectCalendar}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Disconnect Calendar
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:inline-flex"
              onClick={handleConnectCalendar}
              disabled={isConnecting}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {isConnecting ? "Connecting..." : "Connect Calendar"}
            </Button>
          )}
          <Button 
            size="sm"
            onClick={handleSetupBot}
          >
            <Bot className="h-4 w-4 mr-2" />
            Setup Bot
          </Button>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title="Connect Google Calendar"
      >
        {!isConfigured ? (
          <div>
            <p className="mb-4">Before connecting to Google Calendar, you need to set up your Google OAuth credentials:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-2 mb-4">
              <li>Create a project in the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Cloud Console</a></li>
              <li>Enable the Google Calendar API for your project</li>
              <li>Create OAuth 2.0 credentials (OAuth client ID)</li>
              <li>Add authorized JavaScript origins for your domain</li>
              <li>Copy your Client ID and set it in the configuration</li>
            </ol>
          </div>
        ) : (
          <>
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
                  <Calendar className="mr-2 h-4 w-4" />
                  Connect Calendar
                </>
              )}
            </Button>
          </>
        )}
      </Modal>

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
    </header>
  );
};

export default Header;

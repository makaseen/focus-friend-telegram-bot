
import React, { useState } from 'react';
import { Modal } from "@/components/ui/modal";
import { useCalendar, CalendarConfigAlert } from "@/contexts/CalendarContext";
import { CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/chat/ChatInterface";
import HeroActions from "@/components/hero/HeroActions";
import CalendarEvents from "@/components/calendar/CalendarEvents";

const HeroSection = () => {
  const [showBotModal, setShowBotModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showSecretInput, setShowSecretInput] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  
  const { 
    calendarConnected, 
    isConnecting, 
    isConfigured,
    connectCalendar, 
    disconnectCalendar, 
    updateClientId,
    updateClientSecret,
    events, 
    refreshEvents 
  } = useCalendar();

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
  
  const handleSaveCredentials = () => {
    if (clientId) {
      updateClientId(clientId);
      if (showSecretInput && clientSecret) {
        updateClientSecret(clientSecret);
      }
      // Close modal if credentials were successfully saved
      if (isConfigured) {
        setShowCalendarModal(false);
      }
    }
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
            
            {/* Show configuration alert if needed */}
            <CalendarConfigAlert />
            
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

      {/* Bot Setup Modal */}
      <Modal
        isOpen={showBotModal}
        onClose={() => setShowBotModal(false)}
        title="Setup Telegram Bot"
      >
        <div className="mb-6">
          <p>To set up your Focus Friend bot on Telegram:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-2 mb-4">
            <li>Open Telegram app on your device</li>
            <li>Search for @FocusFriendBot in the search bar</li>
            <li>Start a conversation with the bot by clicking "Start"</li>
            <li>Follow the setup instructions provided by the bot</li>
          </ol>
          <p className="text-sm text-gray-500 italic">
            Note: For this demo, the bot may not be active. In a real implementation, 
            you would need to create and host your own Telegram bot.
          </p>
          
          <Button 
            className="w-full mt-4 bg-focus hover:bg-focus-dark"
            onClick={() => setShowBotModal(false)}
          >
            Got it
          </Button>
        </div>
      </Modal>

      {/* Calendar Connection Modal */}
      <Modal
        isOpen={showCalendarModal}
        onClose={() => {
          setShowCalendarModal(false);
          setShowSecretInput(false);
          setClientId('');
          setClientSecret('');
        }}
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
              <li><strong>Important:</strong> Make sure to enable the Google Calendar API in your Google Cloud project's API Library</li>
              <li>During OAuth consent screen setup, request scopes for calendar.readonly and calendar.events.readonly</li>
              <li>Copy your Client ID and set it below</li>
            </ol>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Client ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded"
                placeholder="Enter your Google OAuth client ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                e.g., 012345678901-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
              </p>
            </div>
            
            {!showSecretInput ? (
              <button
                onClick={() => setShowSecretInput(true)}
                className="text-xs text-blue-500 hover:underline mb-4 block"
              >
                + Add Client Secret (optional)
              </button>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Client Secret (optional)
                </label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded"
                  placeholder="Enter your Google OAuth client secret"
                />
                <p className="text-xs text-gray-500 mt-1">
                  For advanced configurations - typically not needed for web applications
                </p>
              </div>
            )}
            
            <Button
              className="w-full mt-4 bg-focus hover:bg-focus-dark"
              onClick={handleSaveCredentials}
              disabled={!clientId}
            >
              Save Credentials
            </Button>
          </div>
        ) : (
          <>
            <p>To connect your Google Calendar:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-2 mb-4">
              <li>We'll need <strong>read-only</strong> access to your Google Calendar</li>
              <li>Your events will sync with Focus Friend</li>
              <li>You'll receive timely reminders and schedule assistance</li>
              <li>Your data is kept private and secure</li>
              <li>If you receive a permission error, ensure Calendar API is enabled in your Google Cloud project</li>
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
          </>
        )}
      </Modal>
    </section>
  );
};

export default HeroSection;

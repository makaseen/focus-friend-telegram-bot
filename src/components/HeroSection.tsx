
import React, { useState } from 'react';
import { useCalendar } from "@/contexts/CalendarContext";
import ChatInterface from "@/components/chat/ChatInterface";
import HeroContent from "@/components/hero/HeroContent";
import BotSetupModal from "@/components/hero/BotSetupModal";
import CalendarConnectionModal from "@/components/hero/CalendarConnectionModal";

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

  const handleCloseCalendarModal = () => {
    setShowCalendarModal(false);
    setShowSecretInput(false);
    setClientId('');
    setClientSecret('');
  };

  return (
    <section className="py-12 md:py-24 lg:py-32 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <HeroContent 
            onGetStarted={handleGetStarted}
            onConnectCalendar={handleConnectCalendar}
            onDisconnectCalendar={disconnectCalendar}
            calendarConnected={calendarConnected}
            isConnecting={isConnecting}
            events={events}
            refreshEvents={refreshEvents}
          />
          
          <div className="flex items-center justify-center">
            <ChatInterface />
          </div>
        </div>
      </div>

      {/* Bot Setup Modal */}
      <BotSetupModal
        isOpen={showBotModal}
        onClose={() => setShowBotModal(false)}
      />

      {/* Calendar Connection Modal */}
      <CalendarConnectionModal 
        isOpen={showCalendarModal}
        onClose={handleCloseCalendarModal}
        isConfigured={isConfigured}
        isConnecting={isConnecting}
        calendarConnected={calendarConnected}
        connectCalendar={initiateCalendarConnection}
        handleSaveCredentials={handleSaveCredentials}
        clientId={clientId}
        setClientId={setClientId}
        clientSecret={clientSecret}
        setClientSecret={setClientSecret}
        showSecretInput={showSecretInput}
        setShowSecretInput={setShowSecretInput}
      />
    </section>
  );
};

export default HeroSection;

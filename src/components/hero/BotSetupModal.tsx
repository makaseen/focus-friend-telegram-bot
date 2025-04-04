
import React from 'react';
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface BotSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BotSetupModal = ({ isOpen, onClose }: BotSetupModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
          onClick={onClose}
        >
          Got it
        </Button>
      </div>
    </Modal>
  );
};

export default BotSetupModal;

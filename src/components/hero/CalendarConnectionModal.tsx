
import React, { useState } from 'react';
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from 'lucide-react';

interface CalendarConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
  isConnecting: boolean;
  calendarConnected: boolean;
  connectCalendar: () => void;
  handleSaveCredentials: () => void;
  clientId: string;
  setClientId: (id: string) => void;
  clientSecret: string;
  setClientSecret: (secret: string) => void;
  showSecretInput: boolean;
  setShowSecretInput: (show: boolean) => void;
}

const CalendarConnectionModal = ({
  isOpen,
  onClose,
  isConfigured,
  isConnecting,
  calendarConnected,
  connectCalendar,
  handleSaveCredentials,
  clientId,
  setClientId,
  clientSecret,
  setClientSecret,
  showSecretInput,
  setShowSecretInput
}: CalendarConnectionModalProps) => {
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
            onClick={connectCalendar}
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
  );
};

export default CalendarConnectionModal;

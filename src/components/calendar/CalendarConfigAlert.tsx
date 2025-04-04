
import React, { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon } from "lucide-react";
import { useCalendar } from '@/hooks/useCalendarContext';

export function CalendarConfigAlert() {
  const { isConfigured, updateClientId, updateClientSecret } = useCalendar();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showSecretInput, setShowSecretInput] = useState(false);

  if (isConfigured) return null;

  return (
    <Alert variant="destructive" className="my-4">
      <CalendarIcon className="h-4 w-4" />
      <AlertTitle>Google Calendar Setup Needed</AlertTitle>
      <AlertDescription>
        <p className="mb-2">You need to set up Google OAuth credentials to use the Calendar feature.</p>
        <p className="mb-2 text-xs">Error: Unable to authenticate with Google. Please provide a valid client ID.</p>
        {!showInput ? (
          <button 
            onClick={() => setShowInput(true)}
            className="text-xs underline hover:text-gray-700"
          >
            Configure now
          </button>
        ) : (
          <div className="mt-2">
            <div className="mb-2">
              <label className="block text-xs mb-1">Client ID <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded mb-1"
                placeholder="Enter your Google OAuth client ID"
              />
              <p className="text-xs text-gray-600">
                From Google Cloud Console &gt; APIs &amp; Services &gt; Credentials
              </p>
            </div>
            
            {!showSecretInput ? (
              <button
                onClick={() => setShowSecretInput(true)}
                className="text-xs underline hover:text-gray-700 mb-2 block"
              >
                + Add Client Secret (optional)
              </button>
            ) : (
              <div className="mb-2">
                <label className="block text-xs mb-1">Client Secret (optional)</label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded mb-1"
                  placeholder="Enter your Google OAuth client secret"
                />
              </div>
            )}
            
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  updateClientId(clientId);
                  if (showSecretInput && clientSecret) {
                    updateClientSecret(clientSecret);
                  }
                }}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                disabled={!clientId}
              >
                Save
              </button>
              <button 
                onClick={() => {
                  setShowInput(false);
                  setShowSecretInput(false);
                  setClientId('');
                  setClientSecret('');
                }}
                className="text-xs bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

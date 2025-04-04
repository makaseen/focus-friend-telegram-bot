
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { googleCalendarApi } from '@/utils/googleCalendar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication response...');
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const processAuth = async () => {
      try {
        // Check if this is the initial auth request or the callback
        const isInitialAuth = location.pathname === '/auth/google';
        
        if (isInitialAuth) {
          console.log('Initial auth request, redirecting to Google...');
          // This is the initial request, redirect to Google OAuth
          const state = location.search.substring(1); // Remove the ? from the search params
          window.location.href = `https://accounts.google.com/o/oauth2/auth?client_id=${googleCalendarApi.getClientId()}&redirect_uri=${encodeURIComponent(`https://preview--focus-friend-telegram-bot.lovable.app/auth/callback`)}&scope=https://www.googleapis.com/auth/calendar&response_type=code&state=${state}&access_type=offline&prompt=consent`;
          return;
        }
        
        // Handle callback - This is the OAuth callback from Google
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const error = params.get('error');
        
        // Handle error case
        if (error) {
          console.error('Authorization error:', error);
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          return;
        }
        
        // Handle success case
        if (code) {
          console.log('Authorization code received, exchanging for token...');
          setMessage('Authentication successful! Processing response...');
          
          try {
            // Exchange the code for a token
            const success = await googleCalendarApi.handleAuthCode(code);
            
            if (success) {
              setStatus('success');
              setMessage('Calendar connected successfully. You can now close this window or return to the app.');
              
              // Redirect back to home page after successful authentication
              setTimeout(() => {
                navigate('/');
              }, 1500);
            } else {
              setStatus('error');
              setMessage('Failed to exchange authorization code for access token.');
            }
          } catch (tokenError) {
            console.error('Token exchange error:', tokenError);
            setStatus('error');
            setMessage(`Failed to exchange code: ${tokenError instanceof Error ? tokenError.message : 'Unknown error'}`);
          }
        } else {
          setStatus('error');
          setMessage('No authorization code received. Please try connecting again.');
        }
      } catch (err) {
        console.error('Error processing authentication:', err);
        setStatus('error');
        setMessage(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    processAuth();
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status === 'processing' && (
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          )}
          
          {status === 'success' && (
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {status === 'error' && (
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          
          <h2 className="text-2xl font-bold mb-2">
            {status === 'processing' ? 'Processing' : status === 'success' ? 'Success!' : 'Error'}
          </h2>
          
          <p className="mb-6 text-gray-600">{message}</p>
          
          <Button
            className="w-full"
            onClick={() => navigate('/')}
          >
            Return to App
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;

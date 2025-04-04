
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { googleCalendarApi } from '@/utils/googleCalendar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getOAuthErrorMessage } from '@/utils/googleCalendar/utils';
import { SCOPES } from '@/utils/googleCalendar/auth';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication response...');
  const location = useLocation();
  const navigate = useNavigate();
  const routeParams = useParams<{ state?: string }>();
  
  useEffect(() => {
    const processAuth = async () => {
      try {
        console.log('Processing auth callback on path:', location.pathname, 'with search:', location.search);
        
        // Check if this is the initial auth request or the callback
        const isInitialAuth = location.pathname.startsWith('/auth/google');
        const isCallback = location.pathname === '/auth/callback';
        
        console.log('Auth type:', { isInitialAuth, isCallback });
        
        if (isInitialAuth && !isCallback) {
          console.log('Initial auth request, redirecting to Google...');
          
          // Get state from either URL parameters or query string
          let state = '';
          
          // Check if it's in the URL parameters (from router params)
          if (routeParams.state) {
            state = routeParams.state;
          } else {
            // If not in URL params, try to get it from query string
            const urlParams = new URLSearchParams(location.search);
            state = urlParams.get('state') || '';
          }
          
          console.log('Using state:', state);
          
          // Get the client ID from localStorage
          const clientId = localStorage.getItem('googleCalendarClientId');
          
          if (!clientId) {
            setStatus('error');
            setMessage('No Google OAuth client ID found. Please set up your credentials first.');
            toast({
              title: "Authentication Error",
              description: "Missing Google OAuth client ID. Please set up your credentials in the app.",
              variant: "destructive"
            });
            return;
          }
          
          // Check if it's a Telegram bot request
          const isTelegramAuth = state?.includes('telegram-');
          
          // Define redirect URI - make sure this matches exactly what's configured in Google Cloud Console
          const redirectUri = `${window.location.origin}/auth/callback`;
          
          // Ensure we're requesting the proper scopes
          const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPES)}&response_type=code&state=${state}&access_type=offline&prompt=consent`;
          
          console.log('Redirecting to Google OAuth URL:', authUrl);
          window.location.href = authUrl;
          return;
        }
        
        // Handle callback - This is the OAuth callback from Google
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state');
        
        console.log('Auth callback parameters:', { 
          code: code ? "Received" : null, 
          error, 
          state 
        });
        
        // Handle error case
        if (error) {
          console.error('Authorization error:', error);
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          toast({
            title: "Authentication Failed",
            description: getOAuthErrorMessage(error),
            variant: "destructive"
          });
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
              // Force refresh the token in memory after successful auth
              googleCalendarApi.loadTokenFromStorage();
              
              setStatus('success');
              const isTelegramAuth = state?.includes('telegram-');
              
              if (isTelegramAuth) {
                setMessage('Calendar connected successfully. You can now close this window and return to Telegram.');
              } else {
                setMessage('Calendar connected successfully. Redirecting you back to the app...');
                
                // Redirect back to home page after successful authentication
                setTimeout(() => {
                  navigate('/');
                }, 1500);
              }
              
              toast({
                title: "Calendar Connected",
                description: "Your Google Calendar has been connected successfully!",
                variant: "default"
              });
            } else {
              setStatus('error');
              setMessage('Failed to exchange authorization code for access token.');
              toast({
                title: "Connection Failed",
                description: "Failed to exchange authorization code for access token.",
                variant: "destructive"
              });
            }
          } catch (tokenError) {
            console.error('Token exchange error:', tokenError);
            setStatus('error');
            setMessage(`Failed to exchange code: ${tokenError instanceof Error ? tokenError.message : 'Unknown error'}`);
            toast({
              title: "Connection Error",
              description: getOAuthErrorMessage(tokenError),
              variant: "destructive"
            });
          }
        } else if (!isInitialAuth) {
          setStatus('error');
          setMessage('No authorization code received. Please try connecting again.');
          toast({
            title: "Authentication Failed",
            description: "No authorization code received from Google.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Error processing authentication:', err);
        setStatus('error');
        setMessage(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
        toast({
          title: "Authentication Error",
          description: getOAuthErrorMessage(err),
          variant: "destructive"
        });
      }
    };

    processAuth();
  }, [location, navigate, routeParams]);

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

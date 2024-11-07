/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

export default function GoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [debug, setDebug] = useState<{
    tokenInfo?: any;
    apiResponse?: any;
    error?: any;
  }>({});

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      console.log('Google OAuth Success:', tokenResponse);
      setDebug(prev => ({ ...prev, tokenInfo: tokenResponse }));

      try {
        console.log('Sending token to API:', {
          access_token: tokenResponse.access_token.slice(0, 10) + '...',
        });

        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });
        
        const data = await response.json();
        console.log('API Response:', data);
        setDebug(prev => ({ ...prev, apiResponse: data }));

        if (!response.ok) {
          throw new Error(`Authentication failed: ${data.error || response.status}`);
        }
        
        localStorage.setItem('gmail_token', tokenResponse.access_token);
        console.log('Token stored in localStorage:', {
          token_preview: tokenResponse.access_token.slice(0, 10) + '...',
          token_length: tokenResponse.access_token.length,
        });
        
      } catch (error) {
        console.error('Authentication Error:', error);
        setDebug(prev => ({ ...prev, error }));
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth Error:', error);
      setDebug(prev => ({ ...prev, error }));
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => login()}
        disabled={isLoading}
        className="bg-white text-gray-800 px-4 py-2 rounded-lg border shadow-sm hover:shadow-md transition-all flex items-center gap-2"
      >
        <svg 
          viewBox="0 0 24 24" 
          width="24" 
          height="24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
          </g>
        </svg>
        {isLoading ? 'Logging in...' : 'Sign in with Google'}
      </button>

      {/* Debug Panel */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm font-mono border border-gray-200">
        <h3 className="text-gray-900 font-semibold mb-2">Debug Info:</h3>
        <div className="space-y-2">
          {debug.tokenInfo && (
            <div>
              <div className="text-gray-900 font-medium">Token Info:</div>
              <pre className="bg-white p-2 rounded border border-gray-200 overflow-x-auto text-gray-800">
                {JSON.stringify({
                  ...debug.tokenInfo,
                  access_token: debug.tokenInfo.access_token,
                }, null, 2)}
              </pre>
            </div>
          )}
          {debug.apiResponse && (
            <div>
              <div className="text-gray-900 font-medium">API Response:</div>
              <pre className="bg-white p-2 rounded border border-gray-200 overflow-x-auto text-gray-800">
                {JSON.stringify(debug.apiResponse, null, 2)}
              </pre>
            </div>
          )}
          {debug.error && (
            <div>
              <div className="text-gray-900 font-medium">Error:</div>
              <pre className="bg-white p-2 rounded border border-gray-200 overflow-x-auto text-red-600">
                {JSON.stringify(debug.error, null, 2)}
              </pre>
            </div>
          )}
          {localStorage.getItem('gmail_token') && (
            <div>
              <div className="text-gray-900 font-medium">Stored Token Preview:</div>
              <pre className="bg-white p-2 rounded border border-gray-200 overflow-x-auto text-gray-800">
                {localStorage.getItem('gmail_token')}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
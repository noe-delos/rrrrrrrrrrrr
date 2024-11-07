// app/page.tsx
'use client';

import EmailList from '@/components/EmailList';
import GoogleLogin from '@/components/GoogleLogin';
import { Inbox, LogOut, Mail } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('gmail_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('gmail_token');
    setIsAuthenticated(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="h-10 w-10 text-blue-500" />
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Gmail Viewer
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Access and manage your Gmail messages in a clean, modern interface.
          </p>
        </div>

        {!isAuthenticated ? (
          /* Auth Section */
          <div className="mb-12">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center mb-6">
                <Inbox className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Connect Your Inbox
                </h2>
                <p className="text-gray-500 text-sm">
                  Sign in with your Google account to view your emails
                </p>
              </div>
              <div className="flex justify-center">
                <GoogleLogin onSuccess={() => setIsAuthenticated(true)} />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* User Info & Logout */}
            <div className="mb-8 flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>

            {/* Email List Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Messages</h2>
              </div>
              <div className="divide-y divide-gray-100">
                <Suspense 
                  fallback={
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        <p className="text-sm text-gray-500">Loading your emails...</p>
                      </div>
                    </div>
                  }
                >
                  <EmailList />
                </Suspense>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Secure access to your Gmail messages • Data never stored</p>
        </div>
      </div>
    </main>
  );
}
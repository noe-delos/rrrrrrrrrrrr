'use client';

import { formatDistanceToNow } from 'date-fns';
import { Mail, Tag, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Email {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  body: string;
  date: string;
  labelIds: string[];
}

export default function EmailList() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const token = localStorage.getItem('gmail_token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/emails', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch emails');
        }

        const data = await response.json();
        setEmails(data.messages);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch emails');
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <p className="text-sm text-gray-500">Loading your emails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No emails found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {emails.map((email) => (
        <div key={email.id} className="p-4 hover:bg-gray-50">
          <div 
            className="cursor-pointer"
            onClick={() => setSelectedEmail(selectedEmail === email.id ? null : email.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <h3 className="font-medium text-gray-900">{email.subject}</h3>
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(parseInt(email.date)), { addSuffix: true })}
              </span>
            </div>
            
            <div className="ml-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <User className="h-4 w-4" />
                <span>{email.from}</span>
              </div>
              
              <p className="text-gray-600 line-clamp-2">
                {email.snippet}
              </p>
              
              {selectedEmail === email.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="prose prose-sm max-w-none">
                    {email.body}
                  </div>
                </div>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                {email.labelIds.map((label) => (
                  <span 
                    key={label}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
// components/EmailList.tsx
'use client';

import { formatDistanceToNow } from 'date-fns';
import { Mail, Sparkles, Tag, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface Email {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  body: string;
  htmlBody?: string; // Added HTML body field
  date: string;
  labelIds: string[];
}

interface AISynthesis {
  emailId: string;
  summary: string;
  loading: boolean;
  error?: string;
}

function EmailContent({ body, htmlBody }: { body: string; htmlBody?: string }) {
  // If we have HTML content, sanitize and render it
  if (htmlBody) {
    return (
      <div 
        className="prose prose-sm max-w-none text-gray-900 email-content"
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(htmlBody, { 
            USE_PROFILES: { html: true },
            ALLOWED_TAGS: [
              'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
              'blockquote', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
              'table', 'tbody', 'tr', 'td', 'th', 'span', 'div', 'img',
              'sub', 'sup', 'b', 'i'
            ],
            ALLOWED_ATTR: [
              'href', 'target', 'rel', 'style', 'class', 'src', 'alt',
              'title', 'width', 'height'
            ]
          }) 
        }}
      />
    );
  }

  // Fallback to plain text with line breaks preserved
  return (
    <div className="prose prose-sm max-w-none text-gray-900 whitespace-pre-wrap">
      {body}
    </div>
  );
}

export default function EmailList() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [syntheses, setSyntheses] = useState<Record<string, AISynthesis>>({});

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

  const generateSynthesis = async (email: Email) => {
    if (syntheses[email.id]?.summary) return;

    setSyntheses(prev => ({
      ...prev,
      [email.id]: { emailId: email.id, summary: '', loading: true }
    }));

    try {
      const response = await fetch('/api/synthesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: email.subject,
          body: email.body,
          htmlBody: email.htmlBody,
          from: email.from,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate synthesis');
      }

      const data = await response.json();
      setSyntheses(prev => ({
        ...prev,
        [email.id]: {
          emailId: email.id,
          summary: data.synthesis,
          loading: false,
        }
      }));
    } catch (error: any) {
      setSyntheses(prev => ({
        ...prev,
        [email.id]: {
          emailId: email.id,
          summary: '',
          loading: false,
          error: 'Failed to generate synthesis'
        }
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <p className="text-sm text-gray-700">Loading your emails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-700 font-medium">No emails found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {emails.map((email) => (
        <div key={email.id} className="p-4 hover:bg-gray-50">
          <div className="cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div 
                className="flex items-center gap-3"
                onClick={() => setSelectedEmail(selectedEmail === email.id ? null : email.id)}
              >
                <Mail className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">{email.subject}</h3>
              </div>
              <span className="text-sm text-gray-700">
                {formatDistanceToNow(new Date(parseInt(email.date)), { addSuffix: true })}
              </span>
            </div>
            
            <div className="ml-8">
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{email.from}</span>
              </div>
              
              <p className="text-gray-800 line-clamp-2">
                {email.snippet}
              </p>
              
              {selectedEmail === email.id && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg overflow-x-auto">
                    <EmailContent body={email.body} htmlBody={email.htmlBody} />
                  </div>

                  {/* AI Synthesis Button and Result */}
                  <div>
                    {!syntheses[email.id]?.summary && (
                      <button
                        onClick={() => generateSynthesis(email)}
                        disabled={syntheses[email.id]?.loading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="h-4 w-4" />
                        {syntheses[email.id]?.loading ? 'Generating...' : 'Generate AI Synthesis'}
                      </button>
                    )}

                    {syntheses[email.id]?.loading && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                          <p className="text-blue-700 font-medium">Generating synthesis...</p>
                        </div>
                      </div>
                    )}

                    {syntheses[email.id]?.error && (
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-red-600 font-medium">{syntheses[email.id].error}</p>
                      </div>
                    )}

                    {syntheses[email.id]?.summary && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">AI Synthesis</h4>
                            <p className="text-gray-800">{syntheses[email.id].summary}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                {email.labelIds.map((label) => (
                  <span 
                    key={label}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-900"
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
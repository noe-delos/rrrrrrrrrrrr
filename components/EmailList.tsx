'use client';

import { useEffect, useState } from 'react';

interface Email {
  id: string;
  snippet: string;
  headers: {
    name: string;
    value: string;
  }[];
}

export default function EmailList() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch('/api/emails');
        const data = await response.json();
        console.log('Fetched emails:', data);
        setEmails(data.emails);
      } catch (error) {
        console.error('Failed to fetch emails:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  if (loading) return <div>Loading emails...</div>;

  return (
    <div className="space-y-4">
      {emails && emails.map((email) => (
        <div key={email.id} className="border p-4 rounded-lg">
          <h2 className="font-semibold">
            {email.headers?.find((h) => h.name === 'Subject')?.value}
          </h2>
          <p className="text-gray-600">
            From: {email.headers?.find((h) => h.name === 'From')?.value}
          </p>
          <p className="mt-2">{email.snippet}</p>
        </div>
      ))}
    </div>
  );
}

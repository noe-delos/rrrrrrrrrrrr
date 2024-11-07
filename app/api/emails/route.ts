/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

async function getMessageDetails(messageId: string, token: string) {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch message details');
  }
  
  return response.json();
}

function decodeBase64Url(data: string) {
  const padding = '='.repeat((4 - (data.length % 4)) % 4);
  const base64 = (data + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return decodeURIComponent(escape(rawData));
}

function getSubject(headers: any[]) {
  const subjectHeader = headers.find(header => header.name === 'Subject');
  return subjectHeader ? subjectHeader.value : 'No Subject';
}

function getFrom(headers: any[]) {
  const fromHeader = headers.find(header => header.name === 'From');
  return fromHeader ? fromHeader.value : 'Unknown Sender';
}

function getMessageBody(payload: any): string {
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain') {
        return part.body.data ? decodeBase64Url(part.body.data) : '';
      }
    }
    // If no text/plain found, try to get from the first part
    return payload.parts[0].body.data ? 
      decodeBase64Url(payload.parts[0].body.data) : '';
  }
  
  return payload.body.data ? decodeBase64Url(payload.body.data) : '';
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // First, get the list of message IDs
    const listResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!listResponse.ok) {
      throw new Error('Failed to fetch message list');
    }

    const listData = await listResponse.json();
    
    // Then fetch details for each message
    const messages = await Promise.all(
      listData.messages.map(async (message: { id: string }) => {
        const messageData = await getMessageDetails(message.id, token);
        
        return {
          id: messageData.id,
          threadId: messageData.threadId,
          subject: getSubject(messageData.payload.headers),
          from: getFrom(messageData.payload.headers),
          snippet: messageData.snippet,
          body: getMessageBody(messageData.payload),
          date: messageData.internalDate,
          labelIds: messageData.labelIds,
        };
      })
    );

    return NextResponse.json({ messages });
    
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}

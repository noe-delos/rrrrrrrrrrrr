import { getGmailClient } from '@/lib/gmail';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const gmail = await getGmailClient();
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });

    const emails = await Promise.all(
      response.data.messages?.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
        });
        return {
          id: email.data.id,
          snippet: email.data.snippet,
          headers: email.data.payload?.headers,
        };
      }) || []
    );

    return NextResponse.json({ emails });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
}

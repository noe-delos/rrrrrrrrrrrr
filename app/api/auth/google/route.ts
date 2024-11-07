import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { access_token } = await request.json();
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token });
    
    // Create Gmail client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Test the connection by getting user profile
    const profile = await gmail.users.getProfile({
      userId: 'me',
    });
    
    return NextResponse.json({ 
      success: true,
      email: profile.data.emailAddress 
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}


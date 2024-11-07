import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { subject, body, from } = await request.json();

    const prompt = `Please provide a clear, concise summary of the following email:

Subject: ${subject}
From: ${from}
Content:
${body}

Please summarize the key points and any required actions in a clear, professional manner.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });

    const synthesis = completion.choices[0].message.content;

    return NextResponse.json({ synthesis });
  } catch (error) {
    console.error('Synthesis generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate synthesis' },
      { status: 500 }
    );
  }
}

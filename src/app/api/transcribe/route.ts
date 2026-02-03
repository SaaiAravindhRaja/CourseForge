import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { audio } = await request.json();

    if (!audio) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const gemini = new GoogleGenAI({ apiKey });

    // Use Gemini 2.0 Flash for audio transcription
    const response = await gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'audio/webm',
                data: audio,
              },
            },
            {
              text: 'Transcribe this audio. Only return the transcription, nothing else.',
            },
          ],
        },
      ],
      config: {
        temperature: 0,
        maxOutputTokens: 1024,
      },
    });

    const text = response.text?.trim() || '';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}

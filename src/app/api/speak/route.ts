// src/app/api/speak/route.ts
import { speakTextStream } from '@/app/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return new NextResponse('Text is required', { status: 400 });
    }

    const audioStream = await speakTextStream(text);
    
    // Return the stream directly
    return new NextResponse(audioStream, {
        headers: {
            'Content-Type': 'audio/pcm',
        },
    });
  } catch (error) {
    console.error('Error in speak API route:', error);
    return new NextResponse('Failed to generate audio', { status: 500 });
  }
}

// src/app/api/speak/route.ts
import { streamTextToSpeech } from '@/ai/flows/stream-text-to-speech';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return new NextResponse('Text is required', { status: 400 });
    }

    const flowStream = await streamTextToSpeech({ text });

    if (!flowStream) {
        throw new Error('The streaming flow did not return a valid stream.');
    }

    const readableStream = new ReadableStream({
        async start(controller) {
            for await (const chunk of flowStream) {
                if (chunk?.output?.custom?.chunk) {
                    controller.enqueue(chunk.output.custom.chunk);
                }
            }
            controller.close();
        }
    });

    return new NextResponse(readableStream, {
        headers: {
            'Content-Type': 'audio/pcm',
        },
    });
  } catch (error) {
    console.error('Error in speak API route:', error);
    return new NextResponse('Failed to generate audio', { status: 500 });
  }
}

'use server';

/**
 * @fileOverview A flow for converting text to speech via streaming.
 *
 * - streamTextToSpeech - A function that converts text to audio chunks.
 * - StreamTextToSpeechInput - The input type for the streamTextToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { streamFlow } from '@genkit-ai/next/streaming';

const StreamTextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type StreamTextToSpeechInput = z.infer<
  typeof StreamTextToSpeechInputSchema
>;

export const streamTextToSpeech = streamFlow(
  {
    name: 'streamTextToSpeech',
    inputSchema: StreamTextToSpeechInputSchema,
    outputSchema: z.string(),
  },
  async ({ text }) => {
    const { stream } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: text,
      stream: true,
    });

    const chunks: string[] = [];
    for await (const chunk of stream) {
      if (chunk.media) {
        const audioBytes = chunk.media.url.substring(
          chunk.media.url.indexOf(',') + 1
        );
        chunks.push(audioBytes);
      }
    }
    return new ReadableStream({
      pull(controller) {
        for (const chunk of chunks) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });
  }
);

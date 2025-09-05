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

const StreamTextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type StreamTextToSpeechInput = z.infer<
  typeof StreamTextToSpeechInputSchema
>;

export const streamTextToSpeech = ai.defineFlow(
  {
    name: 'streamTextToSpeech',
    inputSchema: StreamTextToSpeechInputSchema,
    outputSchema: z.any(),
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
    
    // This is now returning a standard ReadableStream from the AI SDK
    // which the action can pipe to the client.
    return stream;
  }
);
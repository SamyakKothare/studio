'use server';

/**
 * @fileOverview A flow for converting speech to text.
 *
 * - speechToText - A function that transcribes audio to text.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SpeechToTextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A recording, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;

export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  return speechToTextFlow(input);
}

const prompt = ai.definePrompt({
    name: 'speechToTextPrompt',
    input: { schema: SpeechToTextInputSchema },
    output: { schema: z.object({ transcription: z.string() }) }, // Output is an object
    prompt: `Transcribe the following audio recording. If there is no discernible speech, return an empty string for the transcription.

Audio: {{media url=audioDataUri}}`,
});


const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async (input) => {
    // First, try to get a structured response.
    const structuredResponse = await prompt(input);
    if (structuredResponse.output?.transcription) {
      return { transcription: structuredResponse.output.transcription };
    }

    // If structured response fails, try a direct generation call as a fallback.
    const llmResponse = await ai.generate({
        prompt: `Transcribe the following audio recording: {{media url=${input.audioDataUri}}}`,
    });
    const transcription = llmResponse.text;

    // If the fallback also fails to produce a result, throw a clear error.
    if (!transcription) {
        throw new Error("No transcription could be generated from the audio. The audio may be silent or contain no clear speech.");
    }
    
    return { transcription };
  }
);

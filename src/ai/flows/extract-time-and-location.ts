'use server';
/**
 * @fileOverview Extracts time and location information from verified text.
 *
 * - extractTimeAndLocation - A function that extracts the time and location from a given text.
 * - ExtractTimeAndLocationInput - The input type for the extractTimeAndLocation function.
 * - ExtractTimeAndLocationOutput - The return type for the extractTimeAndLocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTimeAndLocationInputSchema = z.object({
  text: z.string().describe('The verified text to extract time and location from.'),
});
export type ExtractTimeAndLocationInput = z.infer<typeof ExtractTimeAndLocationInputSchema>;

const ExtractTimeAndLocationOutputSchema = z.object({
  time: z.string().optional().describe('The time extracted from the text, if any.'),
  location: z.string().optional().describe('The location extracted from the text, if any.'),
});
export type ExtractTimeAndLocationOutput = z.infer<typeof ExtractTimeAndLocationOutputSchema>;

export async function extractTimeAndLocation(input: ExtractTimeAndLocationInput): Promise<ExtractTimeAndLocationOutput> {
  return extractTimeAndLocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTimeAndLocationPrompt',
  input: {schema: ExtractTimeAndLocationInputSchema},
  output: {schema: ExtractTimeAndLocationOutputSchema},
  prompt: `You are an expert at extracting time and location information from text.\n\n  Extract the time and location from the following text, if present. If either the time or location is not present, omit that output field. Only include the city, and not the country. Do not assume any timezone. If the time is not specific, omit it. Output ONLY JSON, and nothing else.\n\n  Text: {{{text}}}`,
});

const extractTimeAndLocationFlow = ai.defineFlow(
  {
    name: 'extractTimeAndLocationFlow',
    inputSchema: ExtractTimeAndLocationInputSchema,
    outputSchema: ExtractTimeAndLocationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

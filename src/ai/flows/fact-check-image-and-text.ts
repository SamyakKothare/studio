'use server';
/**
 * @fileOverview A fact-checking AI agent for images and text.
 *
 * - factCheckImageAndText - A function that handles the fact-checking process for an image and a related question.
 * - FactCheckImageAndTextInput - The input type for the factCheckImageAndText function.
 * - FactCheckImageAndTextOutput - The return type for the factCheckImageAndText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FactCheckImageAndTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  query: z.string().describe('The question to ask about the image.'),
});
export type FactCheckImageAndTextInput = z.infer<typeof FactCheckImageAndTextInputSchema>;

const FactCheckImageAndTextOutputSchema = z.object({
  verdict: z.enum(['TRUE', 'FAKE']).describe('The verdict of the fact-check.'),
  confidenceScore: z.number().min(0).max(100).describe('The confidence score of the verdict (0-100%).'),
  confidenceReasoning: z.string().describe('A brief explanation for the confidence score.'),
  sources: z.array(z.object({
    url: z.string().url().or(z.string()).describe('The URL of the source.'),
    summary: z.string().describe('A brief summary of why this source is relevant to the fact-check.'),
  })).describe('A list of valid URL sources used in the verification process, along with summaries.'),
  when: z.string().optional().describe('When the statement is true.'),
  where: z.string().optional().describe('Where the statement is true.'),
  explanation: z.string().describe('A brief, neutral explanation of the broader topic for context.'),
});
export type FactCheckImageAndTextOutput = z.infer<typeof FactCheckImageAndTextOutputSchema>;


export async function factCheckImageAndText(input: FactCheckImageAndTextInput): Promise<FactCheckImageAndTextOutput> {
  return factCheckImageAndTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'factCheckImageAndTextPrompt',
  input: {schema: FactCheckImageAndTextInputSchema},
  output: {schema: FactCheckImageAndTextOutputSchema},
  prompt: `You are a fact-checking expert. Your task is to determine the truthfulness of the given statement about the provided image.

Image: {{media url=photoDataUri}}
Statement: {{{query}}}

1.  Analyze the image and the statement.
2.  Research the statement using reliable sources such as wikipedia, government websites, NASA, ISRO, and google search.
3.  Aggregate information from multiple sources to improve accuracy and confidence.
4.  Determine a verdict (TRUE or FAKE) based on your research.
5.  Calculate a confidence score (0-100%) representing the reliability of the verdict based on source agreement and credibility.
6.  Provide a brief reasoning for the confidence score.
7.  If the statement is true, extract "when" and "where" from it.
8.  Provide a list of valid URL sources used in the verification process. For each source, provide a brief summary of its relevance.
9.  Provide a brief, neutral explanation of the broader topic for context.

Output the verdict, confidence score, confidence reasoning, sources with summaries, when, where, and the explanation in JSON format.`,
});

const factCheckImageAndTextFlow = ai.defineFlow(
  {
    name: 'factCheckImageAndTextFlow',
    inputSchema: FactCheckImageAndTextInputSchema,
    outputSchema: FactCheckImageAndTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

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
    url: z.string().describe('The URL of the source, or a Google Search query if a stable URL is not available (e.g., "Google Search: History of the Eiffel Tower").'),
    summary: z.string().describe('A brief summary of why this source is relevant to the fact-check.'),
  })).describe('A list of sources used in the verification process. These should be stable, high-level URLs or Google Search queries.'),
  when: z.string().optional().describe('When the statement is true.'),
  where: z.string().optional().describe('Where the statement is true.'),
  explanation: z.string().describe('A brief, neutral explanation of the broader topic for context.'),
  manipulationAnalysis: z.object({
    isManipulated: z.boolean().describe('Whether the image appears to be digitally manipulated or AI-generated.'),
    manipulationConfidence: z.number().min(0).max(100).describe('The confidence score for the manipulation analysis (0-100%).'),
    manipulationReasoning: z.string().describe('A brief explanation for the manipulation analysis, detailing what was found.'),
  }).describe('An analysis of the image for signs of digital manipulation or AI generation.'),
});
export type FactCheckImageAndTextOutput = z.infer<typeof FactCheckImageAndTextOutputSchema>;


export async function factCheckImageAndText(input: FactCheckImageAndTextInput): Promise<FactCheckImageAndTextOutput> {
  return factCheckImageAndTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'factCheckImageAndTextPrompt',
  input: {schema: FactCheckImageAndTextInputSchema},
  output: {schema: FactCheckImageAndTextOutputSchema},
  prompt: `You are a world-class expert in both fact-checking and digital image forensics. Your task is to perform a two-part analysis on the provided image and statement.

Image: {{media url=photoDataUri}}
Statement: {{{query}}}

**Part 1: Factual Verification**
1.  Analyze the statement in the context of the image.
2.  Research the statement using reliable sources.
3.  For sources, prioritize providing stable, high-level URLs (e.g., main article pages from Wikipedia, NASA, major news outlets). Avoid deep links to specific, obscure pages that might break.
4.  If you cannot find a stable, reliable URL for a piece of information, you MUST provide a Google Search query instead. Format it as: "Google Search: [your search query]". For example: "Google Search: evidence of water on Mars".
5.  Determine a verdict (TRUE or FAKE).
6.  Calculate a confidence score (0-100%) for your verdict.
7.  Provide a brief reasoning for the confidence score.
8.  If the statement is true, extract "when" and "where" from it.
9.  Provide a brief, neutral explanation of the broader topic for context.

**Part 2: Image Manipulation Analysis**
1.  Perform a forensic analysis of the image itself. Look for signs of digital manipulation, such as AI generation (deepfakes), Photoshop edits, inconsistent lighting, unnatural shadows, impossible geometry, or compression artifacts.
2.  Determine if the image appears to be manipulated (isManipulated: true/false).
3.  Provide a confidence score for this manipulation analysis (manipulationConfidence: 0-100%).
4.  Provide a brief, non-technical reasoning for your analysis.

**VERY IMPORTANT**: You MUST return a valid JSON object. If you cannot verify the claim or find any sources, you MUST return a 'verdict' of 'FAKE', a 'confidenceScore' of 0, an empty 'sources' array, a 'manipulationAnalysis' object with 'isManipulated' set to false and 'manipulationConfidence' set to 0, and an 'explanation' stating that the claim could not be verified. Do not fail the request. Every source MUST be a valid, high-level URL or be explicitly formatted as a "Google Search: [query]".

Output the combined results of both parts in a single JSON object. Ensure all source URLs are valid or are formatted as Google Search queries.`,
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

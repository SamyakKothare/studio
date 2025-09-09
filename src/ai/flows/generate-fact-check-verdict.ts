'use server';
/**
 * @fileOverview Fact-checking AI agent.
 *
 * - generateFactCheckVerdict - A function that handles the fact-checking process.
 * - GenerateFactCheckVerdictInput - The input type for the generateFactCheckVerdict function.
 * - GenerateFactCheckVerdictOutput - The return type for the generateFactCheckVerdict function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFactCheckVerdictInputSchema = z.object({
  text: z.string().describe('The text to be fact-checked.'),
});
export type GenerateFactCheckVerdictInput = z.infer<typeof GenerateFactCheckVerdictInputSchema>;

const GenerateFactCheckVerdictOutputSchema = z.object({
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
});
export type GenerateFactCheckVerdictOutput = z.infer<typeof GenerateFactCheckVerdictOutputSchema>;

export async function generateFactCheckVerdict(input: GenerateFactCheckVerdictInput): Promise<GenerateFactCheckVerdictOutput> {
  return generateFactCheckVerdictFlow(input);
}

const generateFactCheckVerdictPrompt = ai.definePrompt({
  name: 'generateFactCheckVerdictPrompt',
  input: {schema: GenerateFactCheckVerdictInputSchema},
  output: {schema: GenerateFactCheckVerdictOutputSchema},
  prompt: `You are a fact-checking expert. Your task is to determine the truthfulness of the given statement.

Statement: {{{text}}}

1.  Research the statement using reliable sources.
2.  For sources, prioritize providing stable, high-level URLs (e.g., main article pages from Wikipedia, NASA, major news outlets). Avoid deep links to specific, obscure pages that are likely to break.
3.  **If you cannot find a stable, reliable URL for a piece of information, you MUST provide a Google Search query instead.** Format it as: "Google Search: [your search query]". For example: "Google Search: evidence of water on Mars".
4.  Determine a verdict (TRUE or FAKE) based on your research.
5.  Calculate a confidence score (0-100%) representing the reliability of the verdict.
6.  Provide a brief reasoning for the confidence score.
7.  If the statement is true, extract "when" and "where" from it.
8.  Provide a brief, neutral explanation of the broader topic for context.

Output a single JSON object with the verdict, confidence score, confidence reasoning, sources (as URLs or Search Queries), when, where, and the explanation.
`,
});

const generateFactCheckVerdictFlow = ai.defineFlow(
  {
    name: 'generateFactCheckVerdictFlow',
    inputSchema: GenerateFactCheckVerdictInputSchema,
    outputSchema: GenerateFactCheckVerdictOutputSchema,
  },
  async input => {
    const {output} = await generateFactCheckVerdictPrompt(input);
    return output!;
  }
);

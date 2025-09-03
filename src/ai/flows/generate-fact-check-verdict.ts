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
  sources: z.array(z.string()).describe('A list of sources used in the verification process.'),
  when: z.string().optional().describe('When the statement is true.'),
    where: z.string().optional().describe('Where the statement is true.'),
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

1.  Research the statement using reliable sources such as wikipedia, government websites, NASA, ISRO, and google search.
2.  Aggregate information from multiple sources to improve accuracy and confidence.
3.  Determine a verdict (TRUE or FAKE) based on your research.
4.  Calculate a confidence score (0-100%) representing the reliability of the verdict based on source agreement and credibility.
5.  If the statement is true, extract "when" and "where" from it.
6.  Provide a list of sources used in the verification process.

Output the verdict, confidence score, sources, when, and where in JSON format.
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

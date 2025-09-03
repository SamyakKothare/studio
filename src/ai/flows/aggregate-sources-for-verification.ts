// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Aggregates information from multiple reliable sources to improve accuracy and confidence in the final verdict.
 *
 * - aggregateSources - A function that aggregates information from multiple sources for fact verification.
 * - AggregateSourcesInput - The input type for the aggregateSources function.
 * - AggregateSourcesOutput - The return type for the aggregateSources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AggregateSourcesInputSchema = z.object({
  claim: z.string().describe('The claim to be fact-checked.'),
  sources: z
    .array(z.string())
    .describe(
      'A list of reliable sources (e.g., URLs, search queries) to collect information from.'
    ),
});
export type AggregateSourcesInput = z.infer<typeof AggregateSourcesInputSchema>;

const AggregateSourcesOutputSchema = z.object({
  aggregatedInformation: z
    .string()
    .describe(
      'Aggregated information from the provided sources, summarized and formatted for fact verification.'
    ),
});
export type AggregateSourcesOutput = z.infer<typeof AggregateSourcesOutputSchema>;

export async function aggregateSources(input: AggregateSourcesInput): Promise<AggregateSourcesOutput> {
  return aggregateSourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aggregateSourcesPrompt',
  input: {schema: AggregateSourcesInputSchema},
  output: {schema: AggregateSourcesOutputSchema},
  prompt: `You are an expert fact-checker. Your task is to aggregate information from the given sources to verify the following claim:\n\nClaim: {{{claim}}}\n\nSources:\n{{#each sources}}- {{{this}}}\n{{/each}}\n\nAggregate the information from these sources, providing a summarized and well-formatted output that can be used for fact verification. Focus on identifying key evidence that supports or refutes the claim. The output should be concise and easy to understand.\n`,
});

const aggregateSourcesFlow = ai.defineFlow(
  {
    name: 'aggregateSourcesFlow',
    inputSchema: AggregateSourcesInputSchema,
    outputSchema: AggregateSourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

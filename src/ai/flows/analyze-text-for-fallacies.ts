'use server';
/**
 * @fileOverview An AI agent that analyzes text for logical fallacies.
 *
 * - analyzeTextForFallacies - A function that identifies and explains logical fallacies in a given text.
 * - AnalyzeTextForFallaciesInput - The input type for the analyzeTextForFallacies function.
 * - AnalyzeTextForFallaciesOutput - The return type for the analyzeTextForFallacies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextForFallaciesInputSchema = z.object({
  text: z.string().describe('The text to be analyzed for logical fallacies.'),
});
export type AnalyzeTextForFallaciesInput = z.infer<typeof AnalyzeTextForFallaciesInputSchema>;

const AnalyzeTextForFallaciesOutputSchema = z.object({
  fallacies: z.array(z.object({
    fallacy: z.string().describe('The name of the logical fallacy found (e.g., "Ad Hominem", "Straw Man").'),
    explanation: z.string().describe('A brief explanation of why this part of the text is considered this fallacy.'),
    excerpt: z.string().describe('The specific quote from the text where the fallacy occurs.'),
  })).describe('A list of logical fallacies found in the text.'),
});
export type AnalyzeTextForFallaciesOutput = z.infer<typeof AnalyzeTextForFallaciesOutputSchema>;

export async function analyzeTextForFallacies(input: AnalyzeTextForFallaciesInput): Promise<AnalyzeTextForFallaciesOutput> {
  return analyzeTextForFallaciesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTextForFallaciesPrompt',
  input: {schema: AnalyzeTextForFallaciesInputSchema},
  output: {schema: AnalyzeTextForFallaciesOutputSchema},
  prompt: `You are an expert in logic and rhetoric. Your task is to analyze the following text for logical fallacies.

Text to Analyze:
{{{text}}}

1.  Read the text carefully.
2.  Identify any logical fallacies present in the argument. Common fallacies include Ad Hominem, Straw Man, False Dilemma, Slippery Slope, Circular Argument, Hasty Generalization, Red Herring, Appeal to Authority, etc.
3.  For each fallacy you identify, create an object with the following fields:
    *   **fallacy**: The name of the logical fallacy.
    *   **explanation**: A brief, clear explanation of why the specific excerpt constitutes that fallacy.
    *   **excerpt**: The exact quote from the text where the fallacy is present.
4.  If no fallacies are found, return an empty array for the "fallacies" field.

Output the results in a single JSON object.`,
});

const analyzeTextForFallaciesFlow = ai.defineFlow(
  {
    name: 'analyzeTextForFallaciesFlow',
    inputSchema: AnalyzeTextForFallaciesInputSchema,
    outputSchema: AnalyzeTextForFallaciesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

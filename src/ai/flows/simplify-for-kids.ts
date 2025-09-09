'use server';
/**
 * @fileOverview An AI agent that simplifies complex text for a younger audience.
 *
 * - simplifyForKids - A function that rephrases a given text to be easily understandable by children.
 * - SimplifyForKidsInput - The input type for the simplifyForKids function.
 * - SimplifyForKidsOutput - The return type for the simplifyForKids function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplifyForKidsInputSchema = z.object({
  textToSimplify: z.string().describe('The complex text that needs to be simplified for a child (around 8-12 years old).'),
});
export type SimplifyForKidsInput = z.infer<typeof SimplifyForKidsInputSchema>;

const SimplifyForKidsOutputSchema = z.object({
    simplifiedExplanation: z.string().describe("The simplified version of the text, written in a friendly, encouraging, and easy-to-understand tone for a child."),
    analogy: z.string().describe("A simple, relatable analogy to help a child understand the core concept of the explanation."),
});
export type SimplifyForKidsOutput = z.infer<typeof SimplifyForKidsOutputSchema>;

export async function simplifyForKids(input: SimplifyForKidsInput): Promise<SimplifyForKidsOutput> {
  return simplifyForKidsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simplifyForKidsPrompt',
  input: {schema: SimplifyForKidsInputSchema},
  output: {schema: SimplifyForKidsOutputSchema},
  prompt: `You are a friendly and patient teacher named "Explorer," and you are great at explaining things to kids (around 8-12 years old).
Your task is to take a complicated explanation and make it super easy and fun to understand.

Explanation to Simplify:
"{{{textToSimplify}}}"

1.  **Rephrase the Explanation**: Rewrite the text in a simple, positive, and encouraging way. Use short sentences and words that a child would know. Avoid jargon and complex ideas.
2.  **Create an Analogy**: Think of a simple analogy or comparison to something a kid would understand (like playground games, food, animals, or school). This will help them grasp the main idea.
3.  **Format the Output**: Return your response as a single JSON object.
`,
});

const simplifyForKidsFlow = ai.defineFlow(
  {
    name: 'simplifyForKidsFlow',
    inputSchema: SimplifyForKidsInputSchema,
    outputSchema: SimplifyForKidsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

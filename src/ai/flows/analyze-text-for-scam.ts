'use server';
/**
 * @fileOverview An AI agent that analyzes text for signs of being a scam.
 *
 * - analyzeTextForScam - A function that identifies and explains scam tactics in a given text.
 * - AnalyzeTextForScamInput - The input type for the analyzeTextForScam function.
 * - AnalyzeTextForScamOutput - The return type for the analyzeTextForScam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextForScamInputSchema = z.object({
  text: z.string().describe('The text to be analyzed for scam tactics (e.g., an email, SMS, or social media post).'),
});
export type AnalyzeTextForScamInput = z.infer<typeof AnalyzeTextForScamInputSchema>;


const TacticSchema = z.object({
    tactic: z.string().describe('The name of the scam tactic detected (e.g., "Urgent Call to Action", "Suspicious Link", "Grammatical Errors", "Request for Personal Information", "Too-Good-To-Be-True Offer").'),
    explanation: z.string().describe('A brief explanation of why this part of the text is a red flag.'),
    excerpt: z.string().describe('The specific quote from the text where the tactic appears.'),
});

const AnalyzeTextForScamOutputSchema = z.object({
  riskLevel: z.enum(['High Risk', 'Medium Risk', 'Likely Safe']).describe('The overall assessed risk level of the message.'),
  summary: z.string().describe('A brief, one-sentence summary of the analysis and recommendation.'),
  detectedTactics: z.array(TacticSchema).describe('A list of scam tactics found in the text. If none are found, return an empty array.'),
});
export type AnalyzeTextForScamOutput = z.infer<typeof AnalyzeTextForScamOutputSchema>;

export async function analyzeTextForScam(input: AnalyzeTextForScamInput): Promise<AnalyzeTextForScamOutput> {
  return analyzeTextForScamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTextForScamPrompt',
  input: {schema: AnalyzeTextForScamInputSchema},
  output: {schema: AnalyzeTextForScamOutputSchema},
  prompt: `You are an expert cybersecurity analyst specializing in detecting phishing, scams, and fraudulent communications. Your task is to analyze the following text and determine if it is a scam.

Text to Analyze:
{{{text}}}

1.  **Analyze the Text**: Carefully read the text and look for common scam tactics, including but not limited to:
    *   **Urgent Call to Action**: Language that creates a sense of panic or demands immediate action (e.g., "your account will be suspended," "act now").
    *   **Suspicious Links**: URLs that seem unusual, are shortened, or don't match the supposed sender.
    *   **Grammatical Errors**: Poor spelling, grammar, or awkward phrasing.
    *   **Request for Personal Information**: Asking for passwords, social security numbers, credit card details, etc.
    *   **Too-Good-To-Be-True Offer**: Promises of free money, lottery wins, or unrealistic discounts.
    *   **Impersonation**: Pretending to be a legitimate organization like a bank, government agency, or well-known company.

2.  **Determine Risk Level**: Based on the number and severity of the tactics found, assess an overall \`riskLevel\`.
    *   **High Risk**: Clear and multiple signs of a scam. Definitely malicious.
    *   **Medium Risk**: Contains suspicious elements but might not be a definite scam. Warrants extreme caution.
    *   **Likely Safe**: Appears to be a legitimate communication.

3.  **Write a Summary**: Provide a brief, one-sentence summary of your findings and a clear recommendation (e.g., "This appears to be a dangerous phishing attempt and you should delete it immediately.").

4.  **Detail Detected Tactics**: For each red flag you identify, create an object detailing the \`tactic\`, \`explanation\`, and the \`excerpt\` from the text. If no tactics are found, the 'detectedTactics' array should be empty.

Output the results in a single, valid JSON object.`,
});

const analyzeTextForScamFlow = ai.defineFlow(
  {
    name: 'analyzeTextForScamFlow',
    inputSchema: AnalyzeTextForScamInputSchema,
    outputSchema: AnalyzeTextForScamOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

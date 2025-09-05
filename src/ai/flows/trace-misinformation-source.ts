'use server';
/**
 * @fileOverview An AI agent that traces the origin and spread of a misinformation claim.
 *
 * - traceMisinformationSource - A function that identifies the origin and spread of a claim.
 * - TraceMisinformationSourceInput - The input type for the traceMisinformationSource function.
 * - TraceMisinformationSourceOutput - The return type for the traceMisinformationSource function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TraceMisinformationSourceInputSchema = z.object({
  claim: z.string().describe('The misinformation claim to be traced.'),
});
export type TraceMisinformationSourceInput = z.infer<typeof TraceMisinformationSourceInputSchema>;

const NodeSchema = z.object({
  id: z.string().describe('A unique identifier for the node, typically the URL or a unique name for a non-URL entity.'),
  label: z.string().describe('A short, display-friendly name for the source (e.g., "Reuters", "Fringe Blog", "Social Media User X").'),
  type: z.enum(['origin', 'amplifier', 'news_outlet', 'social_media']).describe('The category of the source.'),
  timestamp: z.string().optional().describe('The approximate date or timestamp when the claim appeared on this source (e.g., "October 2018").'),
});

const LinkSchema = z.object({
  source: z.string().describe('The ID of the source node from which the information spread.'),
  target: z.string().describe('The ID of the target node that received and spread the information.'),
});

const TraceMisinformationSourceOutputSchema = z.object({
  nodes: z.array(NodeSchema).describe('A list of sources (websites, profiles) involved in spreading the claim. If none are found, return an empty array.'),
  links: z.array(LinkSchema).describe('A list of connections showing how the claim spread from source to target. If none are found, return an empty array.'),
  summary: z.string().describe('A brief narrative explaining the likely origin and path of the claim\'s spread.'),
});
export type TraceMisinformationSourceOutput = z.infer<typeof TraceMisinformationSourceOutputSchema>;

export async function traceMisinformationSource(input: TraceMisinformationSourceInput): Promise<TraceMisinformationSourceOutput> {
  return traceMisinformationSourceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'traceMisinformationSourcePrompt',
  input: {schema: TraceMisinformationSourceInputSchema},
  output: {schema: TraceMisinformationSourceOutputSchema},
  prompt: `You are an expert digital forensics analyst. Your task is to trace the origin and spread of a misinformation claim across the internet.

Claim: {{{claim}}}

1.  **Identify the Origin**: Conduct a deep search to find the earliest credible instance of this claim. This could be a fringe blog, a specific social media post, or an obscure forum. Label this as the 'origin'.
2.  **Track the Spread**: Identify key websites, major news outlets, and influential social media accounts that picked up and spread the claim. Label these as 'amplifier', 'news_outlet', or 'social_media'.
3.  **Construct the Network**:
    *   Create a 'node' for each source you identify. The 'id' should be the URL if possible, or a unique descriptive name (e.g., 'user-on-twitter-@example'). The 'label' should be a clean name (e.g., "Example News").
    *   For each source, try to identify the approximate date or timestamp of when the claim appeared and include it in a 'timestamp' field. If a timestamp cannot be found, you can omit the field.
    *   Create 'links' to show the flow of information. For example, if 'Fringe Blog' (source) was cited by 'Major News Outlet' (target), create a link between them.
4.  **Summarize the Findings**: Write a brief narrative explaining the likely origin of the claim and the path it took to spread.

Provide a comprehensive analysis in the final JSON object. If no definitive nodes or links can be found, you MUST return empty arrays for those fields. Your response must strictly adhere to the requested JSON schema.`,
});

const traceMisinformationSourceFlow = ai.defineFlow(
  {
    name: 'traceMisinformationSourceFlow',
    inputSchema: TraceMisinformationSourceInputSchema,
    outputSchema: TraceMisinformationSourceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

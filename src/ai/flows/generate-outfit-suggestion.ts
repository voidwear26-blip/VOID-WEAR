'use server';
/**
 * @fileOverview NEURAL STYLIST FLOW
 * Generates technical outfit recommendations based on user input and the VOID WEAR catalogue.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StylistInputSchema = z.object({
  userPrompt: z.string().describe('The user\'s style request or occasion description.'),
  catalog: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.string(),
    price: z.number().optional()
  })).describe('The current list of available product modules.')
});

export type StylistInput = z.infer<typeof StylistInputSchema>;

const StylistOutputSchema = z.object({
  narrative: z.string().describe('Cinematic explanation of the curated outfit.'),
  suggestedProductIds: z.array(z.string()).describe('IDs of the recommended product modules.'),
  stylingTips: z.string().describe('Short technical advice for the selected assembly.')
});

export type StylistOutput = z.infer<typeof StylistOutputSchema>;

const stylistPrompt = ai.definePrompt({
  name: 'stylistPrompt',
  input: { schema: StylistInputSchema },
  output: { schema: StylistOutputSchema },
  prompt: `You are the VOID WEAR Neural Stylist, an advanced AI designed for high-density urban fashion curation.

CONTEXT:
User Request: "{{{userPrompt}}}"
Available Assemblages:
{{#each catalog}}
- Module: {{{name}}} (ID: {{{id}}}) | Category: {{{category}}} | Description: {{{description}}}
{{/each}}

TASK:
1. Analyze the user's request and identify the most suitable combination of modules from the catalog.
2. Provide a cinematic narrative (approx 60 words) explaining why this selection fits their "Digital Migration".
3. Return the IDs of the suggested modules (strictly from the catalog provided).
4. Provide a technical styling tip.

TONE:
Futuristic, minimalist, authoritative, and cinematic. Use jargon like "physical anchor", "orbital materials", and "geometric forms".

FORMAT:
Strictly JSON matching the output schema.`,
});

export async function generateOutfitSuggestion(input: StylistInput): Promise<StylistOutput> {
  const { output } = await stylistPrompt(input);
  if (!output) throw new Error('NEURAL_SYNTHESIS_FAILURE');
  return output;
}

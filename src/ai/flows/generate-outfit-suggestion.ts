'use server';
/**
 * @fileOverview A Genkit flow for generating outfit suggestions based on user descriptions.
 *
 * - generateOutfitSuggestion - A function that handles the outfit suggestion process.
 * - GenerateOutfitSuggestionInput - The input type for the generateOutfitSuggestion function.
 * - GenerateOutfitSuggestionOutput - The return type for the generateOutfitSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOutfitSuggestionInputSchema = z.object({
  styleDescription: z
    .string()
    .describe(
      'A description of the desired style or occasion for an outfit, e.g., "futuristic cyberpunk outfit for a night out", "minimalist daily wear".'
    ),
});
export type GenerateOutfitSuggestionInput = z.infer<
  typeof GenerateOutfitSuggestionInputSchema
>;

const GenerateOutfitSuggestionOutputSchema = z.object({
  outfitDescription: z
    .string()
    .describe('A detailed textual description of the suggested outfit.'),
  suggestedItems: z
    .array(z.string())
    .describe(
      'A list of generic product types that make up the suggested outfit, fitting the VOID WEAR aesthetic.'
    ),
});
export type GenerateOutfitSuggestionOutput = z.infer<
  typeof GenerateOutfitSuggestionOutputSchema
>;

export async function generateOutfitSuggestion(
  input: GenerateOutfitSuggestionInput
): Promise<GenerateOutfitSuggestionOutput> {
  return generateOutfitSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOutfitSuggestionPrompt',
  input: {schema: GenerateOutfitSuggestionInputSchema},
  output: {schema: GenerateOutfitSuggestionOutputSchema},
  prompt: `You are the VOID WEAR AI Style Assistant. Your goal is to suggest complete outfit combinations based on a user's desired style or occasion.
VOID WEAR products are characterized by a dark, futuristic, minimalist aesthetic, often featuring glowing elements, subtle particle effects, and geometric designs.

Imagine you have access to a product catalog filled with items that fit this description.
Based on the following user input, generate a detailed outfit description and a list of suggested generic product types from the VOID WEAR collection that would fit this style.

User's desired style/occasion: {{{styleDescription}}}`,
});

const generateOutfitSuggestionFlow = ai.defineFlow(
  {
    name: 'generateOutfitSuggestionFlow',
    inputSchema: GenerateOutfitSuggestionInputSchema,
    outputSchema: GenerateOutfitSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

/**
 * VOID WEAR NEURAL INTERFACE
 * Initializing Genkit for architectural narrative generation.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});

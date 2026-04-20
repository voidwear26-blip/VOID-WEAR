import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * VOID WEAR NEURAL INTERFACE
 * Initializing Genkit for architectural narrative generation.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});

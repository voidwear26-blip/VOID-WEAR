import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * VOID WEAR NEURAL INTERFACE
 * Initializing Genkit for architectural narrative generation.
 * Safety protocol: Uses environment API key if available, else warns.
 */
const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey || apiKey.includes('placeholder')) {
  console.warn('NEURAL_INTERFACE_WARNING: AI API key missing. Genkit functions may fail.');
}

export const ai = genkit({
  plugins: [googleAI({ apiKey })],
  model: 'googleai/gemini-1.5-flash',
});

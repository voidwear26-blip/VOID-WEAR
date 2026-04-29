'use server';
/**
 * @fileOverview NEURAL NOTIFICATION GENERATOR
 * Generates cinematic status updates for order transitions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NotificationInputSchema = z.object({
  productName: z.string().describe('The name of the product being tracked.'),
  status: z.string().describe('The current shipping status (processing, shipped, delivered).'),
  trackingId: z.string().optional().describe('The tracking identifier if available.'),
  operatorName: z.string().describe('The name of the user receiving the update.')
});

export type NotificationInput = z.infer<typeof NotificationInputSchema>;

const NotificationOutputSchema = z.object({
  emailContent: z.string().describe('Cinematic email body content.'),
  smsContent: z.string().describe('Short-form SMS/Mobile notification content.')
});

export type NotificationOutput = z.infer<typeof NotificationOutputSchema>;

const notificationPrompt = ai.definePrompt({
  name: 'notificationPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: NotificationInputSchema },
  output: { schema: NotificationOutputSchema },
  prompt: `You are the VOID WEAR System Intelligence. Your tone is futuristic, professional, cinematic, and minimalist.

Address the user as "OPERATOR {{{operatorName}}}".

CONTEXT:
Product: {{{productName}}}
Status Transition: {{{status}}}
{{#if trackingId}}Tracking Identifier: {{{trackingId}}}{{/if}}

TASK:
Generate a high-immersion notification update. Use technical jargon like "orbital transit", "neural uplink", "physical shell", and "void protocols".

For EMAIL: Provide a detailed narrative update (approx 100 words).
For SMS: Provide a high-impact, short update (approx 20 words).

FORMAT:
Strictly JSON as per output schema.`,
});

export async function generateNotificationContent(input: NotificationInput): Promise<NotificationOutput> {
  const { output } = await notificationPrompt(input);
  if (!output) throw new Error('NEURAL_GEN_FAILURE');
  return output;
}

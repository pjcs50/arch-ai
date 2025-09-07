'use server';
/**
 * @fileOverview Explains the design rationale behind certain architectural choices.
 *
 * - explainDesignRationale - A function that takes user choices and explains the architectural reasoning behind them.
 * - ExplainDesignRationaleInput - The input type for the explainDesignRationale function.
 * - ExplainDesignRationaleOutput - The return type for the explainDesignRationale function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainDesignRationaleInputSchema = z.object({
  userChoices: z.string().describe('A description of the users design choices.'),
});
export type ExplainDesignRationaleInput = z.infer<typeof ExplainDesignRationaleInputSchema>;

const ExplainDesignRationaleOutputSchema = z.object({
  explanation: z.string().describe('An explanation of the design rationale behind the given choices.'),
});
export type ExplainDesignRationaleOutput = z.infer<typeof ExplainDesignRationaleOutputSchema>;

export async function explainDesignRationale(input: ExplainDesignRationaleInput): Promise<ExplainDesignRationaleOutput> {
  return explainDesignRationaleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainDesignRationalePrompt',
  input: {schema: ExplainDesignRationaleInputSchema},
  output: {schema: ExplainDesignRationaleOutputSchema},
  prompt: `You are an expert architect. A user has made the following design choices: {{{userChoices}}}. Explain the architectural rationale behind these choices. Focus on explaining WHY these details matter for the overall design. Use architectural terminology naturally.  Be professional but friendly in your explanation.`,
});

const explainDesignRationaleFlow = ai.defineFlow(
  {
    name: 'explainDesignRationaleFlow',
    inputSchema: ExplainDesignRationaleInputSchema,
    outputSchema: ExplainDesignRationaleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

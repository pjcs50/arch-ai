'use server';
/**
 * @fileOverview Generates a floor plan image based on a detailed architectural prompt.
 *
 * - generateFloorPlan - A function that takes an architectural prompt and returns an image data URI.
 * - GenerateFloorPlanInput - The input type for the generateFloorPlan function.
 * - GenerateFloorPlanOutput - The return type for the generateFloorPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFloorPlanInputSchema = z.object({
  architecturalPrompt: z.string().describe('A detailed architectural prompt for generating a floor plan.'),
});
export type GenerateFloorPlanInput = z.infer<typeof GenerateFloorPlanInputSchema>;

const GenerateFloorPlanOutputSchema = z.object({
  floorPlanImage: z
    .string()
    .describe(
      "The generated floor plan image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateFloorPlanOutput = z.infer<typeof GenerateFloorPlanOutputSchema>;

export async function generateFloorPlan(input: GenerateFloorPlanInput): Promise<GenerateFloorPlanOutput> {
  return generateFloorPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFloorPlanPrompt',
  input: {schema: GenerateFloorPlanInputSchema},
  output: {schema: GenerateFloorPlanOutputSchema},
  prompt: `Generate a 2D, black and white floor plan based on the following architectural prompt. The floor plan should be clear, professional, and adhere to standard architectural conventions.

  Architectural Prompt: {{{architecturalPrompt}}}
  
  Generate the floor plan image.`,
  model: 'googleai/imagen-4.0-fast-generate-001',
  response: {
    format: 'media',
  }
});

const generateFloorPlanFlow = ai.defineFlow(
  {
    name: 'generateFloorPlanFlow',
    inputSchema: GenerateFloorPlanInputSchema,
    outputSchema: GenerateFloorPlanOutputSchema,
  },
  async input => {
    const {media} = await prompt(input);
    return { floorPlanImage: media.url };
  }
);

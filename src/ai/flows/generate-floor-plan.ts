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

const generateFloorPlanFlow = ai.defineFlow(
  {
    name: 'generateFloorPlanFlow',
    inputSchema: GenerateFloorPlanInputSchema,
    outputSchema: GenerateFloorPlanOutputSchema,
  },
  async (input) => {
    //
    // TEMPORARY WORKAROUND: The Imagen API requires a billing account.
    // To allow for testing without a billing account, we are returning
    // a static placeholder image. To re-enable live image generation,
    // comment out the following line and uncomment the ai.generate call.
    //
    return { floorPlanImage: 'https://picsum.photos/1024/768' };


    /*
    // UNCOMMENT THIS BLOCK TO RE-ENABLE LIVE IMAGE GENERATION
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a 2D, black and white floor plan with dimensions, labels, and architectural symbols based on the following architectural prompt. The floor plan should be clear, professional, and adhere to standard architectural conventions.

      Architectural Prompt: ${input.architecturalPrompt}`,
    });
    
    if (!media.url) {
      throw new Error('Image generation failed.');
    }

    return { floorPlanImage: media.url };
    */
  }
);

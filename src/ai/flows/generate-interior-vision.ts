'use server';
/**
 * @fileOverview Generates an interior design concept image based on a floor plan and aesthetic preferences.
 *
 * - generateInteriorVision - A function that takes a floor plan and preferences and returns an image data URI.
 * - GenerateInteriorVisionInput - The input type for the function.
 * - GenerateInteriorVisionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInteriorVisionInputSchema = z.object({
  floorPlanImage: z
    .string()
    .describe(
      "The final floor plan image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  aestheticPreferences: z.string().describe("A text description of the user's desired aesthetic (e.g., 'modern farmhouse', 'bright and airy')."),
  architecturalStyle: z.string().describe("The architectural style of the home."),
});
export type GenerateInteriorVisionInput = z.infer<typeof GenerateInteriorVisionInputSchema>;

const GenerateInteriorVisionOutputSchema = z.object({
  interiorImage: z
    .string()
    .describe(
      "The generated interior design image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GenerateInteriorVisionOutput = z.infer<typeof GenerateInteriorVisionOutputSchema>;

export async function generateInteriorVision(input: GenerateInteriorVisionInput): Promise<GenerateInteriorVisionOutput> {
  return generateInteriorVisionFlow(input);
}

const generateInteriorVisionFlow = ai.defineFlow(
  {
    name: 'generateInteriorVisionFlow',
    inputSchema: GenerateInteriorVisionInputSchema,
    outputSchema: GenerateInteriorVisionOutputSchema,
  },
  async ({ floorPlanImage, aestheticPreferences, architecturalStyle }) => {
    
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {text: `Based on the provided floor plan, generate a single, photo-realistic interior design rendering of the main living area (kitchen and great room).

The design must be consistent with the following style and aesthetic:
- Architectural Style: ${architecturalStyle}
- Aesthetic Preferences: ${aestheticPreferences}

The rendering should be from a human-eye-level perspective, looking from the living room towards the kitchen. It should be bright, inviting, and look like a professional architectural visualization.`},
        { media: { url: floorPlanImage } },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    if (!media.url) {
      throw new Error('Interior image generation failed.');
    }

    return { interiorImage: media.url };
  }
);

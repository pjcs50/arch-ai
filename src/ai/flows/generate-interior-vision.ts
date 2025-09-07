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
        {text: `**Objective:** Transform the provided 2D floor plan into a single, photo-realistic, fully furnished 3D interior rendering.

**Viewpoint:** The output image must be a **top-down axonometric view** (a "dollhouse" view) with a slight angle, so the walls have height and the furniture is clearly visible in 3D. Do not produce a flat, 2D image.

**Execution:**
1.  **Interpret the Blueprint:** The provided image is a 2D floor plan. You must strictly adhere to its layout, room dimensions, and the placement of all doors and windows.
2.  **Furnish and Decorate:** Fully furnish every room and space shown in the floor plan. The furniture, materials, colors, and lighting must be consistent with the user's stated style.
3.  **Apply Style:**
    *   **Architectural Style:** ${architecturalStyle}
    *   **Aesthetic Preferences:** ${aestheticPreferences}
4.  **Final Quality:** The final rendering must be high-resolution, professionally lit, and visually appealing, accurately representing the look and feel of a lived-in home based on the specified aesthetics.`},
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

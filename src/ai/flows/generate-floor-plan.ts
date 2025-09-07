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
    
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {text: `You are an expert architectural CAD technician. Your task is to generate a professional, high-quality 2D floor plan based on a set of requirements.

**CRITICAL INSTRUCTIONS:**
1.  **Output Format:** Generate a single, clean, black and white 2D floor plan image.
2.  **Text Legibility:** All text, including room labels and dimensions, MUST be clear, bold, and easily readable. Use a sans-serif font at a minimum effective size of 12pt. Do not use handwritten or overly stylized fonts.
3.  **Dimensioning:**
    *   All dimension lines must be clean, straight, and clearly associated with the specified walls or features.
    *   Ensure the total square footage calculation is accurate and prominently displayed.
    *   Include a graphical scale (e.g., 1/4" = 1'-0" or 1:50).
4.  **Symbols and Details:**
    *   Use standard architectural symbols for all elements.
    *   Explicitly include door swing indicators for all doors.
    *   Strategically place window symbols to maximize natural light as requested.
    *   Include symbols for electrical outlets on walls in key areas like the kitchen, bedrooms, and living room.
    *   Draw the specified kitchen island with seating clearly marked.
5.  **Accuracy:** Adhere STRICTLY to the room counts and features specified in the prompt (e.g., exactly 4 bedrooms, 3.5 bathrooms).

**Architectural Prompt to Execute:**
${input.architecturalPrompt}`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    if (!media.url) {
      throw new Error('Image generation failed.');
    }

    return { floorPlanImage: media.url };
  }
);

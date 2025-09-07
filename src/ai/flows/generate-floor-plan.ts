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
      "The generated floor plan image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
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
        {text: `You are an expert architectural designer and CAD technician. Your task is to generate a professional, high-quality 2D floor plan based on a set of requirements. You must strictly adhere to universal design principles and avoid common architectural failures.

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

---
**UNIVERSAL ARCHITECTURAL DESIGN FAILURES (MUST AVOID):**

*   **Broken Functional Zoning:** Do NOT scatter wet zones (bathrooms, kitchen); group them. Do NOT place noisy zones (kitchen) next to quiet zones (office). Ensure a clear public/private gradient.
*   **Circulation Disasters:** Do NOT obstruct primary workflows (like the kitchen triangle). Do NOT have hallways that lead nowhere. Avoid forcing traffic through rooms. Create a clear main circulation spine.
*   **Impossible Structural Scenarios:** Do NOT create large unsupported spans without indicating beams or columns. Do NOT place stairs in a way that creates structural issues for joists.
*   **Anti-Functional Layouts:** Ensure rooms are shaped to allow for standard furniture placement. Do NOT destroy the kitchen work triangle. Provide adequate storage.
*   **Privacy & Acoustics Ignored:** Create buffer zones between noisy and quiet areas. Avoid unwanted sightlines.
*   **Wasted Space:** Minimize circulation area and avoid oddly shaped, unusable spaces.
*   **Daylight & Ventilation Ignored:** Do not create internal rooms without windows. Place windows strategically based on orientation.
*   **Accessibility Absent:** Ensure hallways are a minimum of 3'6" (1.1m) wide.

---
**UNIVERSAL DESIGN PRINCIPLES (MUST ENFORCE):**

*   **Spatial Organization:** Group wet areas. Create a clear public-to-private progression. Establish a primary circulation spine.
*   **Structural Logic:** Indicate load-bearing walls. Place stairs in dedicated structural bays.
*   **Human Factors:** Maintain the kitchen work triangle. Size rooms for standard furniture with clearance. Include adequate storage (aim for ~10% of floor area).
*   **Building Performance:** Place windows on all exterior walls for light and ventilation.
*   **Proportionality:** Size rooms appropriately for their function. Minimize circulation to maximize livable space.

---
**ARCHITECTURAL PROMPT TO EXECUTE:**
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

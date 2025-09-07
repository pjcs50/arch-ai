'use server';
/**
 * @fileOverview Critiques and refines a floor plan image based on user requirements.
 *
 * This flow takes an existing floor plan image and a set of user requirements,
 * and then uses Nano Banana's image-editing capabilities to generate an
 * improved floor plan through an iterative loop to enhance quality.
 *
 * - refineFloorPlan - The main function for the refinement process.
 * - RefineFloorPlanInput - The input type for the function.
 * - RefineFloorPlanOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineFloorPlanInputSchema = z.object({
  floorPlanImage: z
    .string()
    .describe(
      "The initial floor plan image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  requirements: z.string().describe("The user's original architectural requirements as a single block of text."),
  originalPrompt: z.string().describe("The original architectural prompt sent to the generation model.")
});
export type RefineFloorPlanInput = z.infer<typeof RefineFloorPlanInputSchema>;


const RefineFloorPlanOutputSchema = z.object({
  refinedFloorPlanImage: z
    .string()
    .describe(
      "The refined floor plan image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type RefineFloorPlanOutput = z.infer<typeof RefineFloorPlanOutputSchema>;


export async function refineFloorPlan(input: RefineFloorPlanInput): Promise<RefineFloorPlanOutput> {
  return refineFloorPlanFlow(input);
}

const refineFloorPlanFlow = ai.defineFlow(
  {
    name: 'refineFloorPlanFlow',
    inputSchema: RefineFloorPlanInputSchema,
    outputSchema: RefineFloorPlanOutputSchema,
  },
  async ({ floorPlanImage, requirements }) => {
    let currentImage = floorPlanImage;

    // PASS 1: Major architectural and functional critique
    console.log('Refining plan (Pass 1 of 2): Major architectural review...');
    const pass1Prompt = `You are a Master Architect. Your task is to critique and EDIT the provided floor plan image to fix major flaws.
      
Compare the floor plan to the user's requirements below and correct all inconsistencies, including:
- Incorrect room counts, sizes, or layouts.
- Violations of universal design principles (e.g., poor circulation, bad zoning).
- Mismatches with the requested architectural style.

Edit the image to resolve these issues directly, outputting a corrected black and white 2D floor plan.

USER REQUIREMENTS:
${requirements}`;
    
    const pass1Result = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            { text: pass1Prompt },
            { media: { url: currentImage } }
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!pass1Result.media?.url) {
      throw new Error('Image refinement failed on pass 1.');
    }
    currentImage = pass1Result.media.url;
    console.log('Pass 1 complete.');

    // PASS 2: Final polish and legibility
    console.log('Refining plan (Pass 2 of 2): Polishing details...');
    const pass2Prompt = `You are an expert CAD technician performing a final quality check. Your task is to meticulously analyze and EDIT the provided floor plan to fix any remaining visual and text issues. Your only output should be the edited image.

**CRITICAL EDITING TASKS:**
1.  **Text Legibility:** Find every piece of text on the floor plan. If it is blurry, warped, misspelled, or uses a stylized/handwritten font, you MUST replace it with clean, bold, legible, sans-serif text. This includes room labels, dimensions, and any notes.
2.  **Dimension Line Clarity:** Examine all dimension lines. They must be perfectly straight, thin, and clearly associated with the walls or features they are measuring. Fix any broken, wavy, or floating dimension lines.
3.  **Symbol Consistency:** Check all architectural symbols (doors, windows, stairs, furniture). They must be standard, consistent, and cleanly drawn. Redraw any symbols that are messy, inconsistent, or distorted. Ensure all door swing arcs are present and correct.
4.  **Line Work Cleanup:** Straighten any wobbly or sketchy lines. Ensure all walls have a consistent, clean thickness. Remove any stray marks, smudges, or visual artifacts.
5.  **Final Output:** The final image must be a professional, high-quality, black and white 2D architectural drawing.

Do not change the layout. Your sole focus is on cleaning up the existing drawing to be perfectly legible and professional.`;
    
    const pass2Result = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            { text: pass2Prompt },
            { media: { url: currentImage } }
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });
    
    if (!pass2Result.media?.url) {
        throw new Error('Image refinement failed on pass 2.');
    }
    currentImage = pass2Result.media.url;
    console.log('Pass 2 complete.');

    return { refinedFloorPlanImage: currentImage };
  }
);

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
    const ITERATIONS = 2; 

    // PASS 1: Major architectural and functional critique
    console.log('Refining plan (Pass 1 of 2): Major architectural review...');
    const pass1Prompt = `You are a Master Architect. Your task is to critique and EDIT the provided floor plan image to fix major flaws.
      
Compare the floor plan to the user's requirements below and correct all inconsistencies, including:
- Incorrect room counts, sizes, or layouts.
- Violations of universal design principles (e.g., poor circulation, bad zoning).
- Mismatches with the requested architectural style.

Edit the image to resolve these issues directly.

USER REQUIREMENTS:
${requirements}`;
    
    const { media: pass1Media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            { text: pass1Prompt },
            { media: { url: currentImage } }
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!pass1Media?.url) {
      throw new Error('Image refinement failed on pass 1.');
    }
    currentImage = pass1Media.url;
    console.log('Pass 1 complete.');

    // PASS 2: Final polish and legibility
    console.log('Refining plan (Pass 2 of 2): Polishing details...');
    const pass2Prompt = `You are a Master Architect focusing on final polish. Your task is to analyze and EDIT the provided floor plan to fix any remaining visual and text issues.
            
Analyze the image and edit it to fix:
- **Text Legibility:** Any blurry, warped, or unreadable text. Make it clean and legible.
- **Dimension Clarity:** Ensure all dimension lines are straight, clean, and easy to read.
- **Symbol Consistency:** Make sure all architectural symbols are standard and distinct.`;
    
    const { media: pass2Media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            { text: pass2Prompt },
            { media: { url: currentImage } }
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });
    
    if (!pass2Media?.url) {
        throw new Error('Image refinement failed on pass 2.');
    }
    currentImage = pass2Media.url;
    console.log('Pass 2 complete.');

    return { refinedFloorPlanImage: currentImage };
  }
);

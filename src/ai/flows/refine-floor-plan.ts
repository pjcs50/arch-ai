'use server';
/**
 * @fileOverview Critiques and refines a floor plan image based on user requirements.
 *
 * This flow takes an existing floor plan image and a set of user requirements,
 * generates a critique and a correction prompt, and then uses Nano Banana's
 * image-editing capabilities to generate an improved floor plan through an
 * iterative loop to enhance quality.
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
  originalPrompt: z.string().describe("The original prompt used to generate the floor plan."),
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

// Define a schema for the critique and correction prompt
const CritiqueSchema = z.object({
    critique: z.string().optional().describe("A detailed critique of the floor plan, identifying inconsistencies with the requirements, illegible text, or design flaws."),
    correctionPrompt: z.string().describe("A detailed prompt for the image generation model to correct the identified flaws. This prompt should be written to EDIT the provided image, not create a new one from scratch."),
});


const refineFloorPlanFlow = ai.defineFlow(
  {
    name: 'refineFloorPlanFlow',
    inputSchema: RefineFloorPlanInputSchema,
    outputSchema: RefineFloorPlanOutputSchema,
  },
  async ({ floorPlanImage, requirements, originalPrompt }) => {

    let currentImage = floorPlanImage;
    const ITERATIONS = 2; // Run the loop twice

    for (let i = 0; i < ITERATIONS; i++) {
        const isFinalPass = i === ITERATIONS - 1;
        let critiquePrompt: string;
        
        console.log(`Refining plan (Pass ${i + 1} of ${ITERATIONS})...`);

        if (isFinalPass) {
            // On the final pass, focus on polish and legibility.
            critiquePrompt = `You are a Master Architect focusing on final polish. Your task is to analyze the provided floor plan and generate a correction prompt to fix any remaining visual and text issues.
            
Analyze the image for:
- **Text Legibility:** Identify any blurry, warped, or unreadable text.
- **Dimension Clarity:** Ensure all dimension lines are straight, clean, and easy to read.
- **Symbol Consistency:** Make sure all architectural symbols are standard and distinct.

Based on your analysis, write a detailed correction prompt for an image generation model to *edit and fix* these visual flaws.`;
        } else {
            // On the first pass, do a full critique against requirements.
            critiquePrompt = `You are a Master Architect. Your task is to critique a floor plan image.
            
Focus on major architectural and functional issues. Compare the floor plan to the user's requirements and identify all inconsistencies, including:
- Incorrect room counts, sizes, or layouts.
- Violations of universal design principles (e.g., poor circulation, bad zoning).
- Mismatches with the requested architectural style.

Based on your critique, generate a highly detailed, specific correction prompt for an image generation model to *edit and fix* the provided image.

USER REQUIREMENTS:
${requirements}

ORIGINAL GENERATION PROMPT:
${originalPrompt}`;
        }

        // Step 1: Generate a critique and a correction prompt.
        const critiqueResponse = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: [
                { text: critiquePrompt },
                { media: { url: currentImage } },
            ],
            output: {
                schema: CritiqueSchema
            },
        });
        
        const critiqueOutput = critiqueResponse.output;

        if (!critiqueOutput || !critiqueOutput.correctionPrompt) {
            throw new Error(`AI failed to generate a correction prompt on pass ${i + 1}.`);
        }
        
        const { critique, correctionPrompt } = critiqueOutput;

        console.log(`AI Critique (Pass ${i + 1}):`, critique || "No critique provided.");
        console.log(`Correction Prompt (Pass ${i + 1}):`, correctionPrompt);
        
        // Step 2: Use Nano Banana to edit the image based on the generated correction prompt.
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.5-flash-image-preview',
            prompt: [
                { text: correctionPrompt },
                { media: { url: currentImage } }
            ],
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        if (!media.url) {
            throw new Error(`Image refinement failed on pass ${i + 1}.`);
        }

        currentImage = media.url;
    }

    return { refinedFloorPlanImage: currentImage };
  }
);

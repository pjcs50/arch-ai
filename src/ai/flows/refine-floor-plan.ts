'use server';
/**
 * @fileOverview Critiques and refines a floor plan image based on user requirements.
 *
 * This flow takes an existing floor plan image and a set of user requirements,
 * generates a critique and a correction prompt, and then uses Nano Banana's
 * image-editing capabilities to generate an improved floor plan.
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
    critique: z.string().describe("A detailed critique of the floor plan, identifying inconsistencies with the requirements, illegible text, or design flaws."),
    correctionPrompt: z.string().describe("A detailed prompt for the image generation model to correct the identified flaws."),
});


const refineFloorPlanFlow = ai.defineFlow(
  {
    name: 'refineFloorPlanFlow',
    inputSchema: RefineFloorPlanInputSchema,
    outputSchema: RefineFloorPlanOutputSchema,
  },
  async ({ floorPlanImage, requirements, originalPrompt }) => {

    // Step 1: Use a powerful model to critique the image and generate a correction prompt.
    const critiqueResponse = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: [
            { text: `You are a Master Architect. Your task is to critique a floor plan image based on a user's requirements and the original generation prompt. Identify all issues, including:
-   Inconsistencies with the user's requirements (e.g., wrong room count, incorrect square footage).
-   Illegible text, dimensions, or symbols.
-   Violations of the universal design principles mentioned in the original prompt.
-   Any other architectural or logical flaws.

Based on your critique, generate a highly detailed, specific correction prompt for an image generation model to fix these issues. This prompt should instruct the model to edit the provided image.

USER REQUIREMENTS:
${requirements}

ORIGINAL GENERATION PROMPT:
${originalPrompt}` },
            { media: { url: floorPlanImage } },
        ],
        output: {
            schema: CritiqueSchema
        },
    });
    
    const { critique, correctionPrompt } = critiqueResponse.output!;
    console.log("AI Critique:", critique);
    console.log("Correction Prompt:", correctionPrompt);


    // Step 2: Use Nano Banana to edit the image based on the correction prompt.
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        { text: correctionPrompt },
        { media: { url: floorPlanImage } }
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
      throw new Error('Image refinement failed.');
    }

    return { refinedFloorPlanImage: media.url };
  }
);

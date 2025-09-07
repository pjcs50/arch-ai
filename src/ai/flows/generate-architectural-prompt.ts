'use server';
/**
 * @fileOverview Generates a detailed architectural prompt based on user-provided home design requirements.
 *
 * - generateArchitecturalPrompt - A function that generates the architectural prompt.
 * - GenerateArchitecturalPromptInput - The input type for the generateArchitecturalPrompt function.
 * - GenerateArchitecturalPromptOutput - The return type for the generateArchitecturalPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateArchitecturalPromptInputSchema = z.object({
  squareFootage: z.string().describe('Total square footage of the house.'),
  lotSize: z.string().describe('Size of the lot.'),
  numRooms: z.string().describe('Number of rooms in the house.'),
  roomTypes: z
    .string()
    .describe(
      'Types of rooms needed (e.g., bedrooms, bathrooms, kitchen, office).'
    ),
  budget: z.string().describe('Budget range for the project.'),
  architecturalStyle: z
    .string()
    .describe(
      'Preferred architectural style (e.g., modern, traditional, contemporary).'
    ),
  lifestyleNeeds: z
    .string()
    .describe(
      'Lifestyle needs and preferences (e.g., work from home, entertainment, family size).'
    ),
  specialRequirements: z
    .string()
    .describe(
      'Any special requirements (e.g., accessibility, sustainability).'
    ),
  materialPreferences: z
    .string()
    .describe('Material preferences for construction and finishes.'),
  aestheticPreferences: z
    .string()
    .describe('Aesthetic preferences for the house.'),
  inspirationImage: z
    .string()
    .describe(
      "Inspirational images as data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
    .optional(),
});

export type GenerateArchitecturalPromptInput = z.infer<
  typeof GenerateArchitecturalPromptInputSchema
>;

const GenerateArchitecturalPromptOutputSchema = z.object({
  architecturalPrompt: z
    .string()
    .describe('A detailed architectural prompt for generating a floor plan.'),
});

export type GenerateArchitecturalPromptOutput = z.infer<
  typeof GenerateArchitecturalPromptOutputSchema
>;

export async function generateArchitecturalPrompt(
  input: GenerateArchitecturalPromptInput
): Promise<GenerateArchitecturalPromptOutput> {
  return generateArchitecturalPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateArchitecturalPromptPrompt',
  input: {schema: GenerateArchitecturalPromptInputSchema},
  output: {schema: GenerateArchitecturalPromptOutputSchema},
  prompt: `You are a professional architect who translates client requirements into detailed architectural prompts for floor plan generation.

  Based on the following information, create a comprehensive architectural prompt that includes all necessary details for generating a professional floor plan with proper symbols, dimensions, and industry standards.

  Total Square Footage: {{{squareFootage}}}
  Lot Size: {{{lotSize}}}
  Number of Rooms: {{{numRooms}}}
  Room Types: {{{roomTypes}}}
  Budget: {{{budget}}}
  Architectural Style: {{{architecturalStyle}}}
  Lifestyle Needs: {{{lifestyleNeeds}}}
  Special Requirements: {{{specialRequirements}}}
  Material Preferences: {{{materialPreferences}}}
  Aesthetic Preferences: {{{aestheticPreferences}}}
  Inspiration Image: {{#if inspirationImage}}{{media url=inspirationImage}}{{/if}}

  Architectural Prompt:`,
});

const generateArchitecturalPromptFlow = ai.defineFlow(
  {
    name: 'generateArchitecturalPromptFlow',
    inputSchema: GenerateArchitecturalPromptInputSchema,
    outputSchema: GenerateArchitecturalPromptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

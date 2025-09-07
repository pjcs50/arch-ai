'use server';
/**
 * @fileOverview The core conversational agent for ArchAI.
 *
 * This agent is responsible for:
 * - Greeting the user and kicking off the conversation.
 * - Understanding the user's messages.
 * - Extracting architectural requirements from the conversation.
 * - Keeping track of which requirements have been gathered.
 * - Asking relevant follow-up questions to gather missing information.
 * - Deciding when all necessary information has been collected.
 * - Responding in a friendly, conversational, and professional manner.
 *
 * - architectAgent - The main flow function for the conversational agent.
 * - ArchitectAgentInput - The input type for the agent.
 * - ArchitectAgentOutput - The return type for the agent.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RequirementsSchema = z.object({
  vision: z.string().optional().describe("The user's overall vision for their dream home."),
  squareFootage: z.string().optional().describe('Total square footage of the house.'),
  lotSize: z.string().optional().describe('Size of the lot.'),
  rooms: z.string().optional().describe('Types and number of rooms needed (e.g., 3 bedrooms, 2.5 bathrooms, home office).'),
  budget: z.string().optional().describe('Budget range for the project.'),
  architecturalStyle: z.string().optional().describe('Preferred architectural style (e.g., modern, traditional, contemporary).'),
  lifestyleNeeds: z.string().optional().describe('Lifestyle considerations (e.g., work from home, entertaining, family size).'),
  specialRequirements: z.string().optional().describe('Special features like accessibility (ramps, elevator) or sustainability.'),
  materialPreferences: z.string().optional().describe('Preferences for construction and finishing materials.'),
  aestheticPreferences: z.string().optional().describe('The desired look and feel of the house.'),
});
export type Requirements = z.infer<typeof RequirementsSchema>;


const ArchitectAgentInputSchema = z.object({
    history: z.array(z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({
            text: z.string()
        }))
    })).describe('The conversation history.'),
    requirements: RequirementsSchema.partial().describe('The architectural requirements gathered so far.'),
    currentMessage: z.string().describe('The latest message from the user.'),
});
export type ArchitectAgentInput = z.infer<typeof ArchitectAgentInputSchema>;

const ArchitectAgentOutputSchema = z.object({
    response: z.string().describe("The AI's conversational response to the user."),
    requirements: RequirementsSchema.partial().describe("The updated set of requirements after processing the user's message."),
    nextStage: z.string().describe("The key of the next conversational stage (e.g., 'vision', 'squareFootage', 'confirmation').")
});
export type ArchitectAgentOutput = z.infer<typeof ArchitectAgentOutputSchema>;


export async function architectAgent(input: ArchitectAgentInput): Promise<ArchitectAgentOutput> {
  return architectAgentFlow(input);
}


const systemPrompt = `You are ArchAI, a friendly and expert AI architect. Your goal is to guide a user through the process of defining the requirements for their dream home.

You must be conversational and professional. Your primary function is to fill in the user's requirements based on the conversation.

Here is the process:
1.  **Analyze the user's message**: Read the user's latest message and compare it with the requirements that have already been gathered.
2.  **Extract Information**: Be thorough. Identify any and all new information in the user's message that can be used to fill in one or more missing requirements. It is critical that you extract all available information from the user's message at once. For example, if they say "I want a 2000 sq ft modern house for my family of 4, with 3 bedrooms", you must extract 'squareFootage', 'architecturalStyle', 'lifestyleNeeds', and 'rooms' in a single turn.
3.  **Update Requirements**: Update the JSON object with all the newly extracted information.
4.  **Determine the Next Step**: After updating the requirements, check if all requirements (from vision to aestheticPreferences) are now filled.
5.  **If Information is Missing**: If requirements are still missing, find the *first* requirement in the list that is still null or an empty string. Formulate a natural, conversational question to ask the user for that *one* specific piece of information. Do not ask for multiple things at once.
6.  **If All Information is Gathered**: If all requirements are filled after your extraction step, you MUST immediately move to the confirmation stage. Your response should be to ask the user for confirmation. Set the 'nextStage' to 'confirmation'. For example: "Great, it looks like I have all the initial details. Please review the summary on the left. Does everything look correct?"
7.  **Handle Greetings/Irrelevant Text**: If the user's message is a simple greeting like "hello" or doesn't contain any relevant architectural information, do not update any requirements. Simply respond to the greeting and ask the next relevant question based on the first missing requirement.
8.  **Confirmation Stage**:
    *   **User says "yes"**: If the current stage is 'confirmation' and the user says 'yes' or 'correct', set the 'nextStage' to 'generation'. The response should be something like "Perfect! I'll start generating the architectural prompt now."
    *   **User says "no"**: If the current stage is 'confirmation' and the user wants to make a change, you must identify which requirement they want to change based on their message. Update that requirement with the new information and then set 'nextStage' back to 'confirmation' and ask for review again.

Available requirement fields to fill: ${Object.keys(RequirementsSchema.shape).join(', ')}.
`;

const architectAgentFlow = ai.defineFlow(
  {
    name: 'architectAgentFlow',
    inputSchema: ArchitectAgentInputSchema,
    outputSchema: ArchitectAgentOutputSchema,
  },
  async ({ history, requirements, currentMessage }) => {
    
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      prompt: `Conversation History:
        ${history.map(msg => `${msg.role}: ${msg.content[0].text}`).join('\n')}
        Current User Message: "${currentMessage}"
        Current Requirements: ${JSON.stringify(requirements)}`,
      output: {
        schema: ArchitectAgentOutputSchema,
      },
      // Loosen safety settings for a more flexible conversation
      config: {
        safetySettings: [{
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE'
        },{
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE'
        },{
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE'
        },{
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE'
        }]
      }
    });

    return llmResponse.output!;
  }
);

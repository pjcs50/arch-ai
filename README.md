# ArchAI: Your AI-Powered Architectural Partner
_A Submission for the Nano Banana 48 Hour Challenge_

ArchAI is an interactive web application that acts as a personal AI architect, guiding users through the complex process of designing their dream home. Through a natural, conversational interface, ArchAI gathers detailed requirements, provides real-time feedback, and uses the power of Gemini 2.5 Flash Image Preview (Nano Banana) to generate a professional-quality 2D floor plan from the conversation.

**Live Demo:** [Link to your deployed application]
**Video Presentation:** [Link to your 2-minute video demo]

![ArchAI Screenshot](https://placehold.co/800x600?text=App+Screenshot+Here)

---

## How It Works: The User Journey

1.  **Conversational Requirement Gathering:** The user engages in a natural conversation with ArchAI. The AI agent intelligently extracts key architectural details from the user's messages, such as square footage, room count, style, and unique needs.
2.  **Real-Time UI Feedback:** As the user provides information, the "Progress Tracker" and "Summary Panel" update in real-time, giving the user a clear overview of their evolving design.
3.  **Architectural Prompt Generation:** Once all requirements are gathered and confirmed, the system uses AI to synthesize the information into a detailed, professional architectural prompt.
4.  **Floor Plan Generation with Nano Banana:** This detailed prompt is then sent to Gemini 2.5 Flash Image. The model's advanced image generation capabilities are used to create a high-quality, technically accurate 2D floor plan, complete with architectural symbols, dimensions, and labels.
5.  **Final Delivery:** The user is presented with the final floor plan directly in the chat, along with options to download the image or copy the generated prompt for use in other tools.

---

## Gemini 2.5 Flash Image Integration

*This section can be used for your "Gemini Integration Write-up" in the Kaggle submission (168 words).*

ArchAI leverages Gemini 2.5 Flash Image Preview (Nano Banana) as its core creative engine, transforming a detailed, AI-generated architectural brief into a professional 2D floor plan. This goes beyond simple text-to-image by using Gemini's advanced ability to interpret complex, structured text containing highly technical constraints and spatial relationships.

Our implementation uses a sophisticated, multi-part prompt that instructs the model to act as an expert CAD technician. We provide it with a list of "Universal Design Principles" to enforce (e.g., grouping wet zones, ensuring structural logic) and a list of "Universal Architectural Failures" to explicitly avoid (e.g., broken circulation, wasted space).

This detailed guidance allows Gemini to generate floor plans that are not only aesthetically pleasing but also functionally sound and architecturally logical. The core of our application—turning a nuanced conversation into a technical visual artifact—is made possible entirely by Gemini's state-of-the-art reasoning and image generation capabilities.

---

## Getting Started Locally

This is a Next.js project bootstrapped with `create-next-app`.

### Prerequisites

- Node.js (v18 or later)
- An active Gemini API Key.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [your-repo-url]
    cd [your-repo-name]
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    - Create a new file named `.env` in the root of the project.
    - Add your Gemini API Key to the file:
      ```
      GEMINI_API_KEY=your_api_key_here
      ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

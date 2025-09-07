import { config } from 'dotenv';
config();

import '@/ai/flows/generate-architectural-prompt.ts';
import '@/ai/flows/explain-design-rationale.ts';
import '@/ai/flows/generate-floor-plan.ts';
import '@/ai/flows/architect-agent.ts';
import '@/ai/flows/refine-floor-plan.ts';
import '@/ai/flows/generate-interior-vision.ts';

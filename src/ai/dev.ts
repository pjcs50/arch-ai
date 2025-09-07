import { config } from 'dotenv';
config();

import '@/ai/flows/generate-architectural-prompt.ts';
import '@/ai/flows/explain-design-rationale.ts';
import '@/ai/flows/generate-floor-plan.ts';

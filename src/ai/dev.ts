import { config } from 'dotenv';
config();

import '@/ai/flows/provide-contextual-follow-up.ts';
import '@/ai/flows/generate-architectural-prompt.ts';
import '@/ai/flows/explain-design-rationale.ts';
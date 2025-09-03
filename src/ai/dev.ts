import { config } from 'dotenv';
config();

import '@/ai/flows/generate-fact-check-verdict.ts';
import '@/ai/flows/aggregate-sources-for-verification.ts';
import '@/ai/flows/extract-time-and-location.ts';
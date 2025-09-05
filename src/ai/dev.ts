import { config } from 'dotenv';
config();

import '@/ai/flows/generate-fact-check-verdict.ts';
import '@/ai/flows/aggregate-sources-for-verification.ts';
import '@/ai/flows/extract-time-and-location.ts';
import '@/ai/flows/speech-to-text.ts';
import '@/ai/flows/fact-check-image-and-text.ts';
import '@/ai/flows/analyze-text-for-fallacies.ts';
import '@/ai/flows/trace-misinformation-source.ts';
import '@/ai/flows/text-to-speech.ts';

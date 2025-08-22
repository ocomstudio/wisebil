// src/lib/genkit.ts
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'GEMINI_API_KEY environment variable not found. ' +
        'Please provide it in your .env file.'
    );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1beta'],
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

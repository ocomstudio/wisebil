// src/lib/genkit.ts
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';
import {dotprompt} from '@genkit-ai/dotprompt';

export const ai = genkit({
  plugins: [
    firebase(),
    googleAI({
      apiVersion: ['v1beta'],
    }),
    dotprompt(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// src/lib/genkit.ts
import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';
import {dotprompt, prompt} from '@genkit-ai/dotprompt';

configureGenkit({
  plugins: [
    firebase(),
    googleAI({
      apiVersion: ['v1beta'],
    }),
    dotprompt({
      // path: '...' // defaults to working directory
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

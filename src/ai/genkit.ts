
'use server';

import { genkit, Ai } from '@genkit-ai/ai';
import { googleAI } from '@genkit-ai/googleai';
import { defineDotprompt } from 'genkit/dotprompt';
import { z } from 'zod';

export const ai: Ai = genkit({
  plugins: [googleAI({ apiVersion: 'v1beta' })],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export { defineDotprompt, z };

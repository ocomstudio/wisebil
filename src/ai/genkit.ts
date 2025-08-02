'use server';

import { genkit, Ai } from '@genkit-ai/ai';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

configureGenkit({
  plugins: [googleAI({ apiVersion: 'v1beta' })],
});

export const ai: Ai = genkit;

export { z };

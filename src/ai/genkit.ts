/**
 * @fileoverview This file initializes the Genkit AI platform with Google AI.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config();

export const ai = genkit({
  plugins: [googleAI()],
});

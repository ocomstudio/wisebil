// src/lib/ai-service.ts
'use server';

import { genkit, generate as genkitGenerate, GenerationCommonOptions, defineTool, Tool, Message as GenkitMessage, defineFlow } from 'genkit';
import { openai } from 'genkitx-openai';
import { z } from 'zod';

export const ai = genkit({
  plugins: [
    openai({
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
      baseURL: 'https://openrouter.ai/api/v1',
    }),
  ],
  logLevel: 'debug',
  enableTracing: true,
});

export type Message = GenkitMessage;

interface GenerateOptions {
  prompt?: string;
  system?: string;
  messages?: Message[];
  isJson?: boolean;
  schema?: z.ZodTypeAny;
  tools?: any[];
  toolChoice?: 'auto' | 'any' | 'none' | 'required';
}

// Prioritized list of models. The service will try them in this order.
const AI_MODELS = [
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-7b-it:free',
  'openai/gpt-3.5-turbo',
];

async function generateWithFallback(options: GenerationCommonOptions) {
  let lastError: any = null;
  for (const modelName of AI_MODELS) {
    try {
      console.log(`Attempting to generate text with model: ${modelName}`);
      const model = ai.model(modelName);
      const result = await genkitGenerate({
        ...options,
        model,
      });
      console.log(`Successfully generated text with model: ${modelName}`);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(
        `Model ${modelName} failed with error:`,
        error instanceof Error ? error.message : String(error)
      );
      continue;
    }
  }
  throw new Error(`All AI models failed to generate a response. Last error: ${lastError?.message || lastError}`);
}

export const model = {
  generate: async (options: GenerationCommonOptions) => {
    return generateWithFallback(options);
  }
};

export { defineFlow, defineTool };
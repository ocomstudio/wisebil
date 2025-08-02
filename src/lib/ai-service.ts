// src/lib/ai-service.ts
'use server';

import { openai } from './openai';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GenerateOptions {
  prompt?: string;
  messages?: Message[];
  isJson?: boolean;
}

// Prioritized list of models. The service will try them in this order.
// Using free, reliable models first to optimize for speed and cost.
const AI_MODELS = [
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-7b-it:free',
  'qwen/qwen-72b-chat',
  'openai/gpt-3.5-turbo',
];

export async function generateWithFallback(options: GenerateOptions): Promise<string | null> {
  const { prompt, messages, isJson = false } = options;

  if (!prompt && !messages) {
    throw new Error('Either prompt or messages must be provided.');
  }

  // Construct the message list for the API call
  const apiMessages = messages || [{ role: 'user' as const, content: prompt! }];

  // Iterate through the models and try each one until a successful response is received.
  for (const model of AI_MODELS) {
    try {
      console.log(`Attempting to generate text with model: ${model}`);
      
      const completion = await openai.chat.completions.create({
        model: model,
        messages: apiMessages,
        temperature: 0.2, // Lower temperature for more predictable, structured output
        max_tokens: 1024,
        response_format: isJson ? { type: "json_object" } : { type: "text" },
      });

      const content = completion.choices[0]?.message?.content;
      
      if (content) {
        console.log(`Successfully generated text with model: ${model}`);
        return content;
      }

    } catch (error) {
      console.warn(`Model ${model} failed with error:`, error instanceof Error ? error.message : String(error));
      // If the error is a 402 (payment required) or 404 (not found), we continue to the next model.
      if (error instanceof Error && (error.message.includes('402') || error.message.includes('404'))) {
        continue; // Try the next model
      }
      // For other errors, we might want to throw immediately, but for robustness, we'll try the next model.
    }
  }

  // If all models fail, throw an error.
  throw new Error('All AI models failed to generate a response.');
}

// src/lib/ai-service.ts
'use server';

import OpenAI from 'openai';
import { z } from 'zod';

// We are using the OpenAI SDK, but configuring it to point to OpenRouter.
// This allows us to use the familiar OpenAI API structure with a variety of models.
const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
});

// Prioritized list of models. The service will try them in this order.
const AI_MODELS = [
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-7b-it:free',
  'openai/gpt-3.5-turbo',
];

interface GenerateOptions {
    system?: string;
    prompt?: string;
    messages?: any[];
    output?: {
        format: 'json';
        schema: z.ZodTypeAny;
    };
}

// Custom model object that mimics the Genkit interface for easy integration.
export const model = {
    generate: async (options: GenerateOptions) => {
        let lastError: any = null;

        const messages = [];
        if (options.system) {
            messages.push({ role: 'system', content: options.system });
        }
        if (options.prompt) {
             messages.push({ role: 'user', content: options.prompt });
        }
        if (options.messages) {
            messages.push(...options.messages);
        }

        const requestPayload: OpenAI.Chat.ChatCompletionCreateParams = {
            messages: messages,
            stream: false,
        };

        if (options.output?.format === 'json') {
            requestPayload.response_format = { type: 'json_object' };
        }

        for (const modelName of AI_MODELS) {
            try {
                console.log(`Attempting to generate text with model: ${modelName}`);
                
                const completion = await openrouter.chat.completions.create({
                    ...requestPayload,
                    model: modelName,
                });
                
                console.log(`Successfully generated text with model: ${modelName}`);
                
                const responseContent = completion.choices[0]?.message?.content;
                if (!responseContent) {
                    throw new Error("Empty response from AI model.");
                }

                if (options.output?.format === 'json') {
                    const parsedJson = JSON.parse(responseContent);
                    // We return an object with an `output` method to mimic Genkit's response structure.
                    return { 
                        output: () => options.output.schema.parse(parsedJson)
                    };
                } else {
                     // We return an object with a `text` method to mimic Genkit's response structure.
                    return {
                        text: () => responseContent,
                        output: () => null, // To satisfy flows that might check for output
                    };
                }

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
};

// These exports are kept for compatibility with the flows that use them.
export const defineFlow = <Input, Output>(config: any, fn: (input: Input) => Promise<Output>) => {
    return fn;
};
export { z as z };
export type { z as Schema };

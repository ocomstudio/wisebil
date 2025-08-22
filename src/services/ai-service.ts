// src/services/ai-service.ts
'use server';

import OpenAI from 'openai';
import { z } from 'zod';

// We are using the OpenAI SDK, but configuring it to point to OpenRouter.
const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || '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',
});

// Prioritized list of models. The service will try them in this order.
const TEXT_MODELS = [
  'mistralai/mistral-7b-instruct:free',
];

const VISION_MODELS = [
    'openai/gpt-4o-2024-05-13', // Switched to a more reliable vision model
];

type GenerateOptions = {
    messages: any[]; // Accept a messages array
    output?: {
        format: 'json';
        schema: z.ZodTypeAny;
    };
    modelType?: 'text' | 'vision';
}

export async function generate(options: GenerateOptions) {
    let lastError: any = null;
    const modelsToTry = options.modelType === 'vision' ? VISION_MODELS : TEXT_MODELS;

    const requestPayload: OpenAI.Chat.ChatCompletionCreateParams = {
        messages: options.messages,
        stream: false,
    };

    if (options.output?.format === 'json') {
        requestPayload.response_format = { type: 'json_object' };
    }
    
    // Correctly format the messages for vision models if needed
    if (options.modelType === 'vision') {
        const userMessage = options.messages.find(m => m.role === 'user');
        if (userMessage && !Array.isArray(userMessage.content)) {
            // The API for vision models expects the content to be an array of objects.
            // If it's a simple string, we wrap it in the expected structure.
            userMessage.content = [{ type: 'text', text: userMessage.content }];
        }
    }


    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting to generate with model: ${modelName}`);
            
            const completion = await openrouter.chat.completions.create({
                ...requestPayload,
                model: modelName,
            });
            
            console.log(`Successfully generated with model: ${modelName}`);
            
            const responseContent = completion.choices[0]?.message?.content;
            if (!responseContent) {
                throw new Error("Empty response from AI model.");
            }

            if (options.output?.format === 'json') {
                try {
                    const parsedJson = JSON.parse(responseContent);
                    return parsedJson;
                } catch (jsonError) {
                     throw new Error(`Failed to parse JSON response from model ${modelName}: ${responseContent}`);
                }
            } else {
                return responseContent;
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

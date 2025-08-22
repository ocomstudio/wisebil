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
  'qwen/qwen3-coder:free',
];

const VISION_MODELS = [
    'qwen/qwen3-coder:free',
];

type GenerateOptions = {
    system?: string;
    prompt?: string;
    messages?: any[];
    output?: {
        format: 'json';
        schema: z.ZodTypeAny;
    };
    modelType?: 'text' | 'vision';
}

export async function generate(options: GenerateOptions) {
    let lastError: any = null;
    const modelsToTry = options.modelType === 'vision' ? VISION_MODELS : TEXT_MODELS;

    const messages = options.messages || [];
    if (options.system) {
        // Ensure system prompt is at the beginning
        if (messages.length > 0 && messages[0].role === 'system') {
            messages[0].content = options.system;
        } else {
            messages.unshift({ role: 'system', content: options.system });
        }
    }
     if (options.prompt) {
         messages.push({ role: 'user', content: options.prompt });
    }

    const requestPayload: OpenAI.Chat.ChatCompletionCreateParams = {
        messages: messages as any, // Cast to any to satisfy type checker for mixed content
        stream: false,
    };

    if (options.output?.format === 'json') {
        requestPayload.response_format = { type: 'json_object' };
    }

    for (const modelName of modelsToTry) {
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
                // Return the raw parsed JSON, let the caller handle schema validation
                return parsedJson;
            } else {
                // Return the text content directly
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

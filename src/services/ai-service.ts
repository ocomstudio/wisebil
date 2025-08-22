// src/services/ai-service.ts
'use server';

import OpenAI from 'openai';
import { z } from 'zod';

// We are using the OpenAI SDK, but configuring it to point to aimlapi.com
const aimlapi = new OpenAI({
    baseURL: "https://api.aimlapi.com",
    apiKey: process.env.AIMLAPI_API_KEY || '69a6a53b7c9e45fab5ca601510db954f',
});

// Prioritized list of models. The service will try them in this order.
const TEXT_MODELS = [
  'gpt-4o-mini',
];

const VISION_MODELS = [
    'gpt-4o-mini',
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
    
    // Create a deep copy of messages to avoid mutation issues.
    const messages = JSON.parse(JSON.stringify(options.messages));

    const requestPayload: OpenAI.Chat.ChatCompletionCreateParams = {
        messages: messages,
        stream: false,
    };

    // If a message contains an audio_url, it's a multimodal request for the vision/audio model
    const isMultimodalRequest = messages.some((m: any) => 
        Array.isArray(m.content) && m.content.some((c: any) => c.type === 'image_url' || c.type === 'audio_url')
    );

    if (isMultimodalRequest && options.modelType !== 'vision') {
        console.warn("Multimodal content detected, forcing modelType to 'vision'");
        options.modelType = 'vision';
    }


    if (options.modelType === 'vision') {
        const userMessage = messages.find((m: any) => m.role === 'user');
        if (userMessage && !Array.isArray(userMessage.content)) {
             // Ensure the user message content is in the correct multimodal format
            userMessage.content = [{ type: 'text', text: userMessage.content }];
        }
    }


    if (options.output?.format === 'json') {
        requestPayload.response_format = { type: 'json_object' };
    }

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting to generate with model: ${modelName}`);
            
            const completion = await aimlapi.chat.completions.create({
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

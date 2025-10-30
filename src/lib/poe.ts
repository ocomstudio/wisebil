// src/lib/poe.ts
import axios from 'axios';
import type { ZodSchema, z } from 'zod';

const POE_API_URL = "https://api.poe.com/v1/chat/completions";
const POE_API_KEY = process.env.POE_API_KEY;

if (!POE_API_KEY) {
    throw new Error('POE_API_KEY environment variable not found.');
}

interface PoeMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | (string | { type: string; [key: string]: any })[];
}

interface callPoeOptions<T> {
    model?: string;
    messages: PoeMessage[];
    systemPrompt?: string;
    jsonResponseSchema?: ZodSchema<T>;
}

export async function callPoe<T>(options: callPoeOptions<T>): Promise<T | string> {
    const {
        model = 'Claude-3-Sonnet',
        messages,
        systemPrompt,
        jsonResponseSchema
    } = options;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POE_API_KEY}`
    };

    const finalMessages = [...messages];
    if (systemPrompt) {
        finalMessages.unshift({ role: 'system', content: systemPrompt });
    }

    const requestBody: any = {
        model,
        messages: finalMessages,
    };

    if (jsonResponseSchema) {
        requestBody.response_format = { type: 'json_object' };
        // We'll add instructions to the last user message to format as JSON
        const lastMessage = finalMessages[finalMessages.length - 1];
        if (typeof lastMessage.content === 'string') {
             lastMessage.content += '\n\nIMPORTANT: Respond strictly with a JSON object that conforms to the provided schema. Do not include any other text, explanations, or markdown formatting. The JSON should be the only thing in your response.';
        }
    }

    try {
        const response = await axios.post(POE_API_URL, requestBody, { headers });
        const content = response.data.choices[0].message.content;

        if (jsonResponseSchema) {
            try {
                const parsedJson = JSON.parse(content);
                return jsonResponseSchema.parse(parsedJson);
            } catch (e) {
                console.error("Failed to parse Poe API JSON response:", e);
                console.error("Raw content:", content);
                throw new Error("Poe API returned invalid JSON.");
            }
        }

        return content as string;

    } catch (error: any) {
        console.error('Error calling Poe API:', error.response?.data || error.message);
        throw new Error(`Poe API call failed: ${error.response?.data?.error?.message || error.message}`);
    }
}

// src/lib/poe.ts
import axios from 'axios';
import type { ZodSchema, z } from 'zod';

const POE_API_URL = "https://api.poe.com/v1/chat/completions";
const POE_API_KEY = process.env.POE_API_KEY;


interface PoeMessage {
    role: 'system' | 'user' | 'assistant' | 'model';
    content: string | (string | { type: string; [key: string]: any })[];
}

interface callPoeOptions<T> {
    model?: string;
    messages: PoeMessage[];
    systemPrompt?: string;
    jsonResponseSchema?: ZodSchema<T>;
}

export async function callPoe<T>(options: callPoeOptions<T>): Promise<T> {
    if (!POE_API_KEY) {
        throw new Error('POE_API_KEY environment variable not found.');
    }
    
    const {
        model = 'Claude-3-Sonnet',
        messages,
        systemPrompt,
        jsonResponseSchema,
    } = options;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POE_API_KEY}`
    };

    const finalMessages = [...messages];
    if (systemPrompt) {
        const systemMessageIndex = finalMessages.findIndex(m => m.role === 'system');
        if (systemMessageIndex !== -1) {
            finalMessages[systemMessageIndex].content = systemPrompt;
        } else {
            finalMessages.unshift({ role: 'system', content: systemPrompt });
        }
    }

    const requestBody: any = {
        model,
        messages: finalMessages,
        temperature: 0.2, // Lower temperature for more deterministic JSON output
    };

    if (jsonResponseSchema) {
        requestBody.response_format = { type: 'json_object' };
        const lastMessage = finalMessages[finalMessages.length - 1];
        if (typeof lastMessage.content === 'string') {
             lastMessage.content += '\n\nIMPORTANT: Respond strictly with a valid JSON object that conforms to the provided schema. Do not include any other text, explanations, or markdown formatting like ```json. The response MUST be ONLY the JSON object.';
        }
    }

    try {
        const response = await axios.post(POE_API_URL, requestBody, { headers });
        
        let content = response.data.choices[0].message.content;

        if (jsonResponseSchema) {
            try {
                // Sometimes the model might still wrap the JSON in markdown
                const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    content = jsonMatch[1];
                }
                const parsedJson = JSON.parse(content);
                return jsonResponseSchema.parse(parsedJson);
            } catch (e: any) {
                console.error("Failed to parse or validate Poe API JSON response:", e.message);
                console.error("Raw content received from Poe:", content);
                throw new Error("Poe API returned invalid or non-conformant JSON.");
            }
        }

        // This path is now only for non-JSON responses
        return content as unknown as T;

    } catch (error: any) {
        console.error('Error calling Poe API:', error.response?.data || error.message);
        throw new Error(`Poe API call failed: ${error.response?.data?.error?.message || error.message}`);
    }
}

// src/lib/poe.ts
import axios from 'axios';
import type { ZodSchema, z } from 'zod';

const POE_API_URL = "https://api.poe.com/v1/chat/completions";
const POE_API_KEY = process.env.POE_API_KEY;

if (!POE_API_KEY) {
    console.error('POE_API_KEY environment variable not found.');
    // We don't throw here to avoid crashing the server build if the file is just being analyzed.
    // The error will be caught in functions that use it.
}

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

export async function callPoe<T>(options: callPoeOptions<T>): Promise<T | string> {
    if (!POE_API_KEY) {
        throw new Error('POE_API_KEY environment variable not set on the server.');
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
        // Poe API prefers the system prompt to be the first message with role 'system'
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

export async function* streamPoe(options: callPoeOptions<any>): AsyncGenerator<string> {
  if (!POE_API_KEY) {
    throw new Error('POE_API_KEY environment variable not set on the server.');
  }
  
  const {
    model = 'Claude-3-Sonnet',
    messages,
    systemPrompt,
  } = options;

  const headers = {
    'Accept': 'text/event-stream',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${POE_API_KEY}`,
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

  const requestBody = {
    model,
    messages: finalMessages,
    stream: true,
  };

  try {
    const response = await fetch(POE_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.body) {
      throw new Error('No response body from Poe API stream.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last, possibly incomplete, line

      for (const line of lines) {
        if (line.startsWith('data: ')) {
           try {
              const content = line.substring(6);
              if (content === '[DONE]') {
                break;
              }
              const data = JSON.parse(content);
              if (data.choices && data.choices[0].delta?.content) {
                yield data.choices[0].delta.content;
              }
            } catch (e) {
                // It's possible to get incomplete JSON objects, so we just log and continue
                console.warn('Could not parse streaming chunk from Poe API:', e);
            }
        }
      }
    }
  } catch (error) {
    console.error('Streaming from Poe API failed:', error);
    throw error;
  }
}
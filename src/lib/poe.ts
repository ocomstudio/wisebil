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
    stream?: boolean;
}

export async function callPoe<T>(options: callPoeOptions<T>): Promise<T | string> {
    const {
        model = 'Claude-3-Sonnet',
        messages,
        systemPrompt,
        jsonResponseSchema,
        stream = false
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
        stream
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
        const response = await axios.post(POE_API_URL, requestBody, { headers, responseType: stream ? 'stream' : 'json' });

        if (stream) {
            // This is a simplified example. In a real app, you'd handle the stream.
            // For this environment, we'll simulate the streaming by just getting the final result.
            // This is a limitation of the current tool execution environment, not the Poe API.
            // The frontend will handle the streaming illusion.
            // Here, we'll just concatenate the stream for non-browser environments if needed.
             if (response.data.readable) { // Node.js stream
                return new Promise((resolve, reject) => {
                    let completeResponse = '';
                    response.data.on('data', (chunk: Buffer) => {
                        const text = chunk.toString('utf8');
                         // Simplified parsing of SSE
                        const lines = text.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const json = JSON.parse(line.substring(6));
                                    if (json.text) {
                                        completeResponse += json.text;
                                    }
                                } catch (e) {
                                    // ignore parse errors
                                }
                            }
                        }
                    });
                    response.data.on('end', () => resolve(completeResponse));
                    response.data.on('error', reject);
                });
            }
        }
        
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

export async function* streamPoe<T>(options: callPoeOptions<T>): AsyncGenerator<string> {
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
    finalMessages.unshift({ role: 'system', content: systemPrompt });
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
      throw new Error('No response body');
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
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.text) {
              yield data.text;
            }
          } catch (e) {
            // Ignore incomplete JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('Streaming Poe API error:', error);
    throw error;
  }
}

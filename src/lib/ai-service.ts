// src/lib/ai-service.ts
'use server';

import {generate as genkitGenerate, GenerationCommonOptions, defineTool, Tool, Message as GenkitMessage} from 'genkit/ai';
import {ai} from './genkit';

export type Message = GenkitMessage;

interface GenerateOptions {
  prompt?: string;
  messages?: Message[];
  isJson?: boolean;
}

// Prioritized list of models. The service will try them in this order.
const AI_MODELS = [
  ai.model('mistralai/mistral-7b-instruct:free'),
  ai.model('google/gemma-7b-it:free'),
  ai.model('openai/gpt-3.5-turbo'),
];

async function generateWithFallback<T>(
  callback: (options: GenerationCommonOptions) => Promise<T>,
  options: GenerationCommonOptions
): Promise<T> {
  let lastError: any = null;
  for (const model of AI_MODELS) {
    try {
      console.log(`Attempting to generate text with model: ${model.name}`);
      const result = await callback({
        ...options,
        model,
      });
      console.log(`Successfully generated text with model: ${model.name}`);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(
        `Model ${model.name} failed with error:`,
        error instanceof Error ? error.message : String(error)
      );
      continue;
    }
  }
  throw new Error(`All AI models failed to generate a response. Last error: ${lastError?.message || lastError}`);
}

export async function generate(options: GenerateOptions): Promise<string | null> {
  const {prompt, messages, isJson = false} = options;

  if (!prompt && !messages) {
    throw new Error('Either prompt or messages must be provided.');
  }

  const apiMessages = messages || [{role: 'user', content: [{text: prompt!}]}];

  const genkitOptions: GenerationCommonOptions = {
    messages: apiMessages,
    config: {
      temperature: 0.2,
      responseFormat: isJson ? 'json' : 'text',
    },
  };

  const response = await generateWithFallback(genkitGenerate, genkitOptions);
  return response.text();
}

export async function generateWithTool<I, O>(
  systemPrompt: string,
  input: I,
  tool: Tool<I, O>
): Promise<O> {
  const options: GenerationCommonOptions = {
    system: systemPrompt,
    prompt: JSON.stringify(input),
    tools: [tool],
    output: {
      format: 'json',
      schema: tool.outputSchema,
    },
  };

  const response = await generateWithFallback(genkitGenerate, options);
  const toolResponse = response.toolResponse();
  if (toolResponse) {
    return toolResponse.output as O;
  }
  
  // Fallback to text generation if tool use fails
  const textResponse = response.text();
  try {
    return tool.outputSchema.parse(JSON.parse(textResponse));
  } catch (e) {
      console.error("Failed to parse tool response as JSON, retrying without tool calling.", e);
      // If parsing fails, try one more time without forcing tool use
      const finalAttempt = await generateWithFallback(genkitGenerate, {
        ...options,
        tools: [],
      });
      return tool.outputSchema.parse(JSON.parse(finalAttempt.text()));
  }
}

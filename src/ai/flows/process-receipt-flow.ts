// src/ai/flows/process-receipt-flow.ts
'use server';

/**
 * @fileOverview An AI flow to process and extract information from a receipt image.
 *
 * - processReceipt - A function that handles the receipt processing.
 * - ProcessReceiptInput - The input type for the processReceipt function.
 * - ProcessReceiptOutput - The return type for the processReceipt function.
 */

import { z } from 'zod';
import OpenAI from 'openai';
import { expenseCategories } from '@/config/categories';
import {
  ProcessReceiptInputSchema,
  ProcessReceiptOutputSchema,
  type ProcessReceiptInput,
  type ProcessReceiptOutput,
} from '@/types/ai-schemas';

export type { ProcessReceiptInput, ProcessReceiptOutput };

// We are using the OpenAI SDK, but configuring it to point to OpenRouter.
const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || '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',
});

// Prioritized list of models. The service will try them in this order.
const AI_MODELS = [
  'openai/gpt-4o',
  'openai/gpt-4-turbo',
];

interface GenerateOptions {
    system?: string;
    messages?: any[];
    output?: {
        format: 'json';
        schema: z.ZodTypeAny;
    };
}

const model = {
    generate: async (options: GenerateOptions) => {
        let lastError: any = null;

        const messages = options.messages || [];
        if (options.system) {
            messages.unshift({ role: 'system', content: options.system });
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
                    return { 
                        output: () => options.output.schema.parse(parsedJson)
                    };
                } else {
                    return {
                        text: () => responseContent,
                        output: () => null,
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

async function processReceiptFlow(input: ProcessReceiptInput): Promise<ProcessReceiptOutput> {
  const systemPrompt = `You are an expert at processing receipts. Analyze the image and extract the following information: merchant name, total amount, and transaction date. Also, suggest an appropriate expense category from this list: ${expenseCategories.map(c => c.name).join(', ')}. If no date is found, use today's date: ${new Date().toISOString().split('T')[0]}.
  You MUST respond ONLY with a JSON object conforming to the output schema.
  The date format MUST be YYYY-MM-DD.`;

  const result = await model.generate({
    system: systemPrompt,
    messages: [{
        role: 'user',
        content: [
            { type: 'text', text: 'Extract the details from this receipt.' },
            {
                type: 'image_url',
                image_url: {
                    url: input.photoDataUri,
                },
            },
        ],
    }],
    output: {
      format: 'json',
      schema: ProcessReceiptOutputSchema,
    },
  });
  
  const output = result.output();
  if (!output) {
    throw new Error("AI failed to generate a response from the receipt image.");
  }
  return output;
}

export async function processReceipt(input: ProcessReceiptInput): Promise<ProcessReceiptOutput> {
  return await processReceiptFlow(input);
}

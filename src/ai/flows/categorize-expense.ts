// src/ai/flows/categorize-expense.ts
'use server';
/**
 * @fileOverview Expense categorization AI flow.
 *
 * - categorizeExpense - A function that handles expense categorization.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import { z } from 'zod';
import OpenAI from 'openai';
import { expenseCategories } from '@/config/categories';
import { CategorizeExpenseOutputSchema, CategorizeExpenseInputSchema, CategorizeExpenseInput, CategorizeExpenseOutput } from '@/types/ai-schemas';

export type { CategorizeExpenseInput, CategorizeExpenseOutput };

// We are using the OpenAI SDK, but configuring it to point to OpenRouter.
const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || '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',
});

// Prioritized list of models. The service will try them in this order.
const AI_MODELS = [
  'openai/gpt-4o',
  'anthropic/claude-3-opus',
  'openai/gpt-4-turbo',
  'mistralai/mistral-7b-instruct:free',
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

const model = {
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

async function categorizeExpenseFlow(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  const systemPrompt = `You are an expert financial advisor. Your job is to categorize expenses based on their description.
Here are the available categories: ${expenseCategories.map((c) => c.name).join(', ')}. You MUST select one of these categories. If no category seems appropriate, choose 'Autre'.
You MUST respond ONLY with a JSON object conforming to the output schema.
The user's preferred language is French (fr).`;

  const result = await model.generate({
    system: systemPrompt,
    prompt: input.description,
    output: {
      format: 'json',
      schema: CategorizeExpenseOutputSchema,
    },
  });
  
  const output = result.output();
  if (!output) {
    throw new Error("AI failed to generate a response.");
  }
  return output;
}

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return await categorizeExpenseFlow(input);
}

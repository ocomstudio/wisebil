// src/ai/flows/financial-summary.ts
'use server';

/**
 * @fileOverview Financial summary AI flow.
 *
 * - getFinancialSummary - A function that generates a financial summary and advice.
 * - FinancialSummaryInput - The input type for the getFinancialSummary function.
 * - FinancialSummaryOutput - The return type for the getFinancialSummary function.
 */

import { z } from 'zod';
import OpenAI from 'openai';
import {
    FinancialSummaryInputSchema,
    FinancialSummaryOutputSchema,
    FinancialSummaryInput,
    FinancialSummaryOutput
} from '@/types/ai-schemas';

export type { FinancialSummaryInput, FinancialSummaryOutput };

// We are using the OpenAI SDK, but configuring it to point to OpenRouter.
const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || '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',
});

// Prioritized list of models. The service will try them in this order.
const AI_MODELS = [
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-7b-it:free',
  'openai/gpt-3.5-turbo',
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

async function getFinancialSummaryFlow(input: FinancialSummaryInput): Promise<FinancialSummaryOutput> {
    const {income, expenses, expensesByCategory, language, currency} = input;
    
    // Handle the case where there is no financial data yet.
    if (income === 0 && expenses === 0) {
        if (language === 'fr') {
        return {
            summary:
            'Bienvenue ! Ajoutez vos premières transactions pour voir votre résumé financier ici.',
            advice:
            'Commencez par enregistrer une dépense ou un revenu pour prendre le contrôle de vos finances.',
        };
        } else {
        return {
            summary:
            'Welcome! Add your first transactions to see your financial summary here.',
            advice:
            'Start by recording an expense or income to take control of your finances.',
        };
        }
    }

    const expensesByCategoryString = expensesByCategory
        .map((e) => `- ${e.name}: ${e.amount} ${currency}`)
        .join('\n');

    const systemPrompt = `You are a friendly and encouraging financial advisor. Your goal is to analyze the user's financial data and provide a simple, positive summary and one actionable piece of advice.
                    
    Your tone must be human, simple, and direct. The user should feel motivated and positive after reading your message. The summary should be one or two sentences MAX. The advice must be one sentence MAX.

    You MUST speak in the user's specified language: ${language}.
    You MUST respond ONLY with a JSON object conforming to the output schema.

    User's financial data:
    - Total Income: ${income} ${currency}
    - Total Expenses: ${expenses} ${currency}
    - Expenses by Category:
    ${expensesByCategoryString}`;

    const result = await model.generate({
        system: systemPrompt,
        prompt: `Based on the provided data, generate a summary and advice.`,
        output: {
            format: 'json',
            schema: FinancialSummaryOutputSchema
        }
    });
    
    const output = result.output();
    if (!output) {
        throw new Error("AI failed to generate a response.");
    }
    return output;
}


export async function getFinancialSummary(input: FinancialSummaryInput): Promise<FinancialSummaryOutput> {
  return await getFinancialSummaryFlow(input);
}

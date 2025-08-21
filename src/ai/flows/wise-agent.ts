// src/ai/flows/wise-agent.ts
'use server';

/**
 * @fileOverview Agent W: A financial data entry specialist AI agent.
 *
 * - runAgentW - A function that handles financial data extraction from text.
 * - AgentWInput - The input type for the runAgentW function.
 * - AgentWOutput - The return type for the runAgentW function.
 */

import { z } from 'zod';
import OpenAI from 'openai';
import { expenseCategories, incomeCategories } from '@/config/categories';
import {
  AgentWInputSchema,
  AgentWOutputSchema,
  AgentWInput,
  AgentWOutput,
} from '@/types/ai-schemas';
export type { AgentWInput, AgentWOutput };

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

async function runAgentWFlow(input: AgentWInput): Promise<AgentWOutput> {
    const { prompt, currency, budgets, savingsGoals } = input;

    const systemPrompt = `You are "Agent W", an expert financial data entry specialist. Your sole purpose is to analyze a user's text, which may be complex, conversational, and unstructured, to identify every single financial action and structure them into a SINGLE JSON object.

**Core Instructions:**
1.  **Parse Complex Text:** The user's prompt is a raw stream of thought. Your primary task is to meticulously read the entire text and hunt for any financial actions: spending money (expenses), receiving money (incomes), creating a budget, creating a savings goal, or adding money to an existing goal. Ignore all non-financial chatter.
2.  **Identify ALL Financial Actions:** Do not miss a single action. You must capture everything from buying coffee to setting up a new savings plan. Each action MUST have all required fields (description, amount, category).
3.  **Extract the Date for Transactions:** Today's date is ${new Date().toISOString().split('T')[0]}. You MUST analyze the text to find the date of each transaction. Look for terms like "hier", "avant-hier", or specific dates like "le 29". If no date is mentioned for a transaction, you MUST use today's date. The date format MUST be YYYY-MM-DD. This applies only to incomes and expenses. This is a required field.
4.  **Categorize Accurately:** For each transaction, assign a category.
    - **Expenses (money spent):** Use one of these: ${expenseCategories.map((c) => c.name).join(', ')}.
    - **Incomes (money received):** Use one of these: ${incomeCategories.map((c) => c.name).join(', ')}.
5.  **Distinguish New vs. Existing:**
    - Existing Budgets: ${budgets.length > 0 ? budgets.map(b => b.name).join(', ') : 'None'}
    - Existing Savings Goals: ${savingsGoals.length > 0 ? savingsGoals.map(s => s.name).join(', ') : 'None'}
    - If the user says "crée un budget pour les courses de 50000", add it to 'newBudgets'.
    - If the user says "ajoute 10000 à mon épargne 'Voiture'", and 'Voiture' is in the existing list, add it to 'savingsContributions'. If 'Voiture' does not exist, create it under 'newSavingsGoals'.
6.  **Handle Currency:** The user's currency is ${currency}. All amounts are in this currency.
7.  **STRICT JSON-ONLY OUTPUT:** You MUST respond ONLY with a JSON object conforming to the output schema. Do not include apologies, explanations, or ANY text outside of the JSON brackets. If no actions of a certain type are found, its corresponding array MUST be empty, for example: "incomes": []. NEVER return a list with an empty object like "incomes": [{}]. The 'date' field for transactions is REQUIRED, and it MUST be in YYYY-MM-DD format.

User prompt: "${prompt}"`;
    
    const result = await model.generate({
        system: systemPrompt,
        prompt: input.prompt,
        output: {
            format: 'json',
            schema: AgentWOutputSchema,
        },
    });

    const output = result.output();
    if (!output) {
        throw new Error("AI failed to generate a response.");
    }
    return output;
}


export async function runAgentW(input: AgentWInput): Promise<AgentWOutput> {
  return await runAgentWFlow(input);
}

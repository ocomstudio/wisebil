
// src/ai/flows/wise-agent.ts
'use server';

/**
 * @fileOverview An AI agent that parses a natural language text to extract and structure financial transactions.
 *
 * - runWiseAgent - A function that takes a user's prompt and returns a list of structured income and expense transactions.
 * - WiseAgentInput - The input type for the runWiseAgent function.
 * - WiseAgentOutput - The return type for the runWiseAgent function.
 */

import { z } from 'zod';
import { openai } from '@/lib/openai';
import { expenseCategories, incomeCategories } from '@/config/categories';

const TransactionSchema = z.object({
  description: z.string().describe("The detailed description of the transaction."),
  amount: z.number().describe("The numeric amount of the transaction."),
  category: z.string().describe("The most relevant category for the transaction."),
});

const WiseAgentInputSchema = z.object({
  prompt: z.string().describe("The user's text describing their daily financial activities."),
  currency: z.string().describe("The user's currency to provide context for amounts."),
});
export type WiseAgentInput = z.infer<typeof WiseAgentInputSchema>;

const WiseAgentOutputSchema = z.object({
  incomes: z.array(TransactionSchema).optional().default([]).describe("A list of all income transactions found in the text."),
  expenses: z.array(TransactionSchema).optional().default([]).describe("A list of all expense transactions found in the text."),
});
export type WiseAgentOutput = z.infer<typeof WiseAgentOutputSchema>;

export async function runWiseAgent(input: WiseAgentInput): Promise<WiseAgentOutput> {
  const { prompt, currency } = WiseAgentInputSchema.parse(input);

  const validExpenseCategories = expenseCategories.map(c => c.name).join(', ');
  const validIncomeCategories = incomeCategories.map(c => c.name).join(', ');

  try {
    const completion = await openai.chat.completions.create({
      model: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
      response_format: { type: 'json_object' },
      messages: [
        {
          role: "system",
          content: `You are "Wise Agent" (WA), an expert financial data entry specialist. Your sole purpose is to analyze a user's text, identify every single financial transaction (both income and expenses), and structure them into a JSON object.

          **Instructions:**
          1.  **Parse Thoroughly:** Read the user's entire prompt and extract all monetary transactions.
          2.  **Categorize Accurately:** Assign a category to each transaction.
              - For expenses, you MUST use one of these categories: ${validExpenseCategories}.
              - For income, you MUST use one of these categories: ${validIncomeCategories}.
              - If no category fits perfectly, choose the most logical one or 'Autre'.
          3.  **Handle Currency:** The user's currency is ${currency}. All amounts should be treated as being in this currency.
          4.  **Strict JSON Output:** You MUST respond ONLY with a JSON object conforming to this Zod schema. If no incomes are found, the 'incomes' array should be empty. If no expenses are found, the 'expenses' array should be empty.
          
          Zod Schema:
          ${JSON.stringify(WiseAgentOutputSchema.shape)}
          `
        },
        {
          role: "user",
          content: `Here is my day: ${prompt}`
        }
      ],
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return WiseAgentOutputSchema.parse(result);

  } catch (error) {
    console.error(`Wise Agent failed to generate a response:`, error);
    throw new Error(`Wise Agent failed to generate a response. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
}

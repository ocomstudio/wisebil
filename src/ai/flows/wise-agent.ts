
// src/ai/flows/wise-agent.ts
'use server';

/**
 * @fileOverview An AI agent that parses a natural language text to extract and structure financial transactions.
 *
 * - runAgentW - A function that takes a user's prompt and returns a list of structured income and expense transactions.
 * - AgentWInput - The input type for the runAgentW function.
 * - AgentWOutput - The return type for the runAgentW function.
 */

import { z } from 'zod';
import { openai } from '@/lib/openai';
import { expenseCategories, incomeCategories } from '@/config/categories';

const TransactionSchema = z.object({
  description: z.string().describe("The detailed description of the transaction."),
  amount: z.number().describe("The numeric amount of the transaction."),
  category: z.string().describe("The most relevant category for the transaction."),
});

const AgentWInputSchema = z.object({
  prompt: z.string().describe("The user's text describing their daily financial activities."),
  currency: z.string().describe("The user's currency to provide context for amounts."),
});
export type AgentWInput = z.infer<typeof AgentWInputSchema>;

const AgentWOutputSchema = z.object({
  incomes: z.array(TransactionSchema).optional().default([]).describe("A list of all income transactions found in the text."),
  expenses: z.array(TransactionSchema).optional().default([]).describe("A list of all expense transactions found in the text."),
});
export type AgentWOutput = z.infer<typeof AgentWOutputSchema>;

export async function runAgentW(input: AgentWInput): Promise<AgentWOutput> {
  const { prompt, currency } = AgentWInputSchema.parse(input);

  const validExpenseCategories = expenseCategories.map(c => c.name).join(', ');
  const validIncomeCategories = incomeCategories.map(c => c.name).join(', ');

  try {
    const completion = await openai.chat.completions.create({
      model: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
      response_format: { type: 'json_object' },
      messages: [
        {
          role: "system",
          content: `You are "Agent W", an expert financial data entry specialist. Your sole purpose is to analyze a user's text, identify every single financial transaction (both income and expenses), and structure them into a JSON object.

          **Instructions:**
          1.  **Parse Thoroughly:** Read the user's entire prompt and extract ALL monetary transactions. This includes both money spent (expenses) and money received (incomes). Pay equal attention to both.
          2.  **Categorize Accurately:** Assign a category to each transaction.
              - For expenses (money spent, purchases, bills paid), you MUST use one of these categories: ${validExpenseCategories}.
              - For incomes (money received, salary, payments, gifts), you MUST use one of these categories: ${validIncomeCategories}.
              - If no category fits perfectly, choose the most logical one or 'Autre'.
          3.  **Handle Currency:** The user's currency is ${currency}. All amounts should be treated as being in this currency.
          4.  **Strict JSON Output:** You MUST respond ONLY with a JSON object conforming to this Zod schema. Do not include any apologies, explanations, or any text outside of the JSON structure. If no incomes are found, the 'incomes' array must be an empty list []. If no expenses are found, the 'expenses' array must be an empty list [].
          
          Zod Schema:
          ${JSON.stringify(AgentWOutputSchema.shape)}
          `
        },
        {
          role: "user",
          content: `Here is my day: ${prompt}`
        }
      ],
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return AgentWOutputSchema.parse(result);

  } catch (error) {
    console.error(`Agent W failed to generate a response:`, error);
    throw new Error(`Agent W failed to generate a response. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
}




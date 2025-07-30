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
          content: `You are "Agent W", an expert financial data entry specialist. Your sole purpose is to analyze a user's text, which may be complex, conversational, and unstructured, to identify every single financial transaction and structure them into a JSON object.

          **Core Instructions:**
          1.  **Parse Complex Text:** The user's prompt is a raw stream of thought. Your primary task is to meticulously read the entire text and hunt for any mention of money being spent (expenses) or received (incomes). Ignore any non-financial chatter or irrelevant details.
          2.  **Identify ALL Transactions:** Do not miss a single transaction. If the user mentions buying coffee, paying a bill, receiving a salary, or getting money from a friend, you must capture it.
          3.  **Categorize Accurately:** For each transaction, you must assign a category.
              - **Expenses (money spent, purchases, bills paid):** You MUST use one of these categories: ${validExpenseCategories}.
              - **Incomes (money received, salary, payments, gifts):** You MUST use one of these categories: ${validIncomeCategories}.
              - Use the context of the sentence to determine the most logical category. If no category fits, use 'Autre'.
          4.  **Handle Currency:** The user's currency is ${currency}. All amounts are in this currency.
          5.  **Strict JSON Output:** You MUST respond ONLY with a JSON object conforming to the Zod schema below. Do not include any apologies, explanations, or any text outside of the JSON. If no incomes are found, the 'incomes' array must be `[]`. If no expenses are found, the 'expenses' array must be `[]`.

          **Example of complex analysis:**
          User Prompt: "Ok so today was crazy, I went to the supermarket and spent 25000 on groceries, then I grabbed a taxi for 3500. Oh and my client finally paid me the 150000 he owed me for the project. I also paid my internet bill which was 15000."
          Expected JSON Output:
          {
            "incomes": [
              { "description": "Payment from client for project", "amount": 150000, "category": "Vente" }
            ],
            "expenses": [
              { "description": "Groceries at supermarket", "amount": 25000, "category": "Alimentation" },
              { "description": "Taxi ride", "amount": 3500, "category": "Transport" },
              { "description": "Internet bill payment", "amount": 15000, "category": "Factures" }
            ]
          }
          
          Zod Schema for your output:
          ${JSON.stringify(AgentWOutputSchema.shape)}
          `
        },
        {
          role: "user",
          content: `Here is my day, please analyze it: ${prompt}`
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

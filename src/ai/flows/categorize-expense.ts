// src/ai/flows/categorize-expense.ts
'use server';
/**
 * @fileOverview Expense categorization AI flow.
 *
 * - categorizeExpense - A function that handles expense categorization.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */
import { callPoe } from '@/lib/poe';
import { expenseCategories } from '@/config/categories';
import { CategorizeExpenseOutputSchema, CategorizeExpenseInputSchema, CategorizeExpenseInput, CategorizeExpenseOutput } from '@/types/ai-schemas';

export type { CategorizeExpenseInput, CategorizeExpenseOutput };


async function categorizeExpenseFlow(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  const systemPrompt = `You are an expert financial advisor. Your job is to categorize expenses based on their description.
Here are the available categories: ${expenseCategories.map((c) => c.name).join(', ')}. You MUST select one of these categories. If no category seems appropriate, choose 'Autre'.
The user's preferred language is French (fr). You must respond in this language.`;
  
  const result = await callPoe({
      messages: [{ role: 'user', content: `Expense description: ${input.description}` }],
      systemPrompt,
      jsonResponseSchema: CategorizeExpenseOutputSchema,
  });

  if (typeof result === 'string' || !result) {
      throw new Error("AI failed to categorize the expense.");
  }
  
  return result as CategorizeExpenseOutput;
}

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return await categorizeExpenseFlow(input);
}

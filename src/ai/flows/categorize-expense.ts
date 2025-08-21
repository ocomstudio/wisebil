// src/ai/flows/categorize-expense.ts
'use server';
/**
 * @fileOverview Expense categorization AI flow.
 *
 * - categorizeExpense - A function that handles expense categorization.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import { expenseCategories } from '@/config/categories';
import { CategorizeExpenseOutputSchema, CategorizeExpenseInputSchema, CategorizeExpenseInput, CategorizeExpenseOutput } from '@/types/ai-schemas';
import { generate } from '@/services/ai-service';

export type { CategorizeExpenseInput, CategorizeExpenseOutput };


async function categorizeExpenseFlow(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  const systemPrompt = `You are an expert financial advisor. Your job is to categorize expenses based on their description.
Here are the available categories: ${expenseCategories.map((c) => c.name).join(', ')}. You MUST select one of these categories. If no category seems appropriate, choose 'Autre'.
You MUST respond ONLY with a JSON object conforming to the output schema.
The user's preferred language is French (fr).`;

  const rawOutput = await generate({
    system: systemPrompt,
    prompt: input.description,
    output: {
      format: 'json',
      schema: CategorizeExpenseOutputSchema,
    },
  });
  
  const output = CategorizeExpenseOutputSchema.parse(rawOutput);
  return output;
}

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return await categorizeExpenseFlow(input);
}

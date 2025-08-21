// src/ai/flows/categorize-expense.ts
'use server';
/**
 * @fileOverview Expense categorization AI flow.
 *
 * - categorizeExpense - A function that handles expense categorization.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import { ai, defineFlow, model } from '@/lib/ai-service';
import { z } from 'zod';
import { expenseCategories } from '@/config/categories';
import { CategorizeExpenseOutputSchema, CategorizeExpenseInputSchema } from '@/types/ai-schemas';

export type { CategorizeExpenseInput, CategorizeExpenseOutput } from '@/types/ai-schemas';


const categorizeExpenseFlow = defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async (input) => {
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
);


export async function categorizeExpense(
  input: z.infer<typeof CategorizeExpenseInputSchema>
): Promise<z.infer<typeof CategorizeExpenseOutputSchema>> {
  return await categorizeExpenseFlow(input);
}
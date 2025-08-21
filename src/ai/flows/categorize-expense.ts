// src/ai/flows/categorize-expense.ts
'use server';
/**
 * @fileOverview Expense categorization AI flow.
 *
 * - categorizeExpense - A function that handles expense categorization.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import {ai} from '@/lib/genkit';
import {z} from 'genkit';
import {expenseCategories} from '@/config/categories';
import {generateWithTool} from '@/lib/ai-service';
import {CategorizeExpenseOutputSchema, CategorizeExpenseInputSchema} from '@/types/ai-schemas';
export type { CategorizeExpenseInput, CategorizeExpenseOutput } from '@/types/ai-schemas';


const categorizeExpenseTool = ai.defineTool(
  {
    name: 'categorizeExpense',
    description:
      'Categorizes an expense based on its description into one of the provided categories.',
    inputSchema: z.object({
      description: z.string(),
    }),
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async (input) => {
    return {
        category: 'Autre',
        confidence: 0.5
    };
  }
);

const systemPrompt = `You are an expert financial advisor. Your job is to categorize expenses based on their description.
Here are the available categories: ${expenseCategories.map((c) => c.name).join(', ')}. You MUST select one of these categories. If no category seems appropriate, choose 'Autre'.
You MUST respond ONLY with a JSON object conforming to the output schema.
The user's preferred language is French (fr).`;

export async function categorizeExpense(
  input: z.infer<typeof CategorizeExpenseInputSchema>
): Promise<z.infer<typeof CategorizeExpenseOutputSchema>> {
  const result = await generateWithTool(
    systemPrompt,
    input,
    categorizeExpenseTool
  );
  return result;
}

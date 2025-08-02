// src/ai/flows/categorize-expense.ts
'use server';

/**
 * @fileOverview An AI agent that categorizes expenses based on transaction descriptions.
 *
 * - categorizeExpense - A function that categorizes an expense based on its description.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { expenseCategories } from '@/config/categories';

const CategorizeExpenseInputSchema = z.object({
  description: z.string().describe('The description of the expense transaction.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

const CategorizeExpenseOutputSchema = z.object({
  category: z.string().describe('The predicted category of the expense.'),
  confidence: z.number().describe('The confidence level of the categorization (0-1).'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}


const prompt = ai.definePrompt({
    name: 'categorizeExpensePrompt',
    input: { schema: CategorizeExpenseInputSchema },
    output: { schema: CategorizeExpenseOutputSchema },
    prompt: `You are an expert financial advisor. Your job is to categorize expenses based on their description.
Here are the available categories: ${expenseCategories.map(c => c.name).join(', ')}.
You MUST respond ONLY with a JSON object conforming to the output schema.
Categorize the following expense description: "{{description}}"`,
});


const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
          throw new Error('AI model failed to generate a response.');
      }
      return output;
    } catch (error) {
      console.error(`AI categorization failed:`, error);
      throw new Error(`AI categorization failed. Details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);

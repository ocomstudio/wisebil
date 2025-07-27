'use server';

/**
 * @fileOverview An AI agent that categorizes expenses based on transaction descriptions.
 *
 * - categorizeExpense - A function that categorizes an expense based on its description.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  input: {schema: CategorizeExpenseInputSchema},
  output: {schema: CategorizeExpenseOutputSchema},
  prompt: `You are an expert financial advisor.  Your job is to categorize expenses based on their description.

  Here are some example categories: Groceries, Utilities, Rent, Transportation, Entertainment, Dining, Shopping, Travel, Health, Education, Bills, Other.

  Given the following expense description, determine the most appropriate category and a confidence level (0-1) for your prediction.

  Description: {{{description}}}

  Respond ONLY with a JSON object conforming to the schema.
  `,
});

const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

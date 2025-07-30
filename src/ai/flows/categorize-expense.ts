'use server';

/**
 * @fileOverview An AI agent that categorizes expenses based on transaction descriptions.
 *
 * - categorizeExpense - A function that categorizes an expense based on its description.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */
import { z } from 'zod';
import { openai } from '@/lib/openai';

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
  const { description } = CategorizeExpenseInputSchema.parse(input);
  
  try {
      const completion = await openai.chat.completions.create({
        model: "google/gemma-7b-it:free",
        response_format: { type: 'json_object' },
        messages: [
          {
            role: "system",
            content: `You are an expert financial advisor. Your job is to categorize expenses based on their description.
      Here are some example categories: Groceries, Utilities, Rent, Transportation, Entertainment, Dining, Shopping, Travel, Health, Education, Bills, Other.
      You MUST respond ONLY with a JSON object conforming to this Zod schema:
      ${JSON.stringify(CategorizeExpenseOutputSchema.shape)}
      `
          },
          {
            role: "user",
            content: `Categorize the following expense description: "${description}"`
          }
        ],
      });
    
      const result = JSON.parse(completion.choices[0].message.content || '{}');
      return CategorizeExpenseOutputSchema.parse(result);
  } catch (error) {
      console.error(`AI model failed to generate a response for category expense:`, error);
      throw new Error(`AI model failed to generate a response. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
}

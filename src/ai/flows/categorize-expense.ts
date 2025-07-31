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
import { generateWithFallback } from '@/lib/ai-service';

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
  const systemPrompt = `You are an expert financial advisor. Your job is to categorize expenses based on their description.
Here are some example categories: Groceries, Utilities, Rent, Transportation, Entertainment, Dining, Shopping, Travel, Health, Education, Bills, Other.
You MUST respond ONLY with a JSON object conforming to the output schema.
Categorize the following expense description: "${input.description}"`;
  
  try {
    const aiResponse = await generateWithFallback({
      prompt: systemPrompt,
      isJson: true,
    });
    
    if (!aiResponse) {
      throw new Error('AI model failed to generate a response.');
    }

    // Clean the response to ensure it's valid JSON
    const jsonString = aiResponse.match(/\{[\s\S]*\}/)?.[0] ?? '{}';
    const parsed = JSON.parse(jsonString);

    const result = CategorizeExpenseOutputSchema.safeParse(parsed);
    if (!result.success) {
        throw new Error(`AI response validation failed: ${result.error.message}`);
    }

    return result.data;
  } catch (error) {
    console.error(`AI categorization failed:`, error);
    throw new Error(`AI categorization failed. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
}

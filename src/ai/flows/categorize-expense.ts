'use server';

import { z } from 'zod';
import { generateWithFallback } from '@/lib/ai-service';
import { expenseCategories } from '@/config/categories';

export const CategorizeExpenseInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the expense transaction.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

export const CategorizeExpenseOutputSchema = z.object({
  category: z.string().describe('The predicted category of the expense.'),
  confidence: z
    .number()
    .describe('The confidence level of the categorization (0-1).'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  const { description } = input;

  const prompt = `You are an expert financial advisor. Your job is to categorize expenses based on their description.
Here are the available categories: ${expenseCategories.map((c) => c.name).join(', ')}. You MUST select one of these categories. If no category seems appropriate, choose 'Autre'.
You MUST respond ONLY with a JSON object conforming to the output schema.
The user's preferred language is French (fr).

Output schema:
{
  "category": "string",
  "confidence": "number (0-1)"
}

Categorize the following expense description: "${description}"`;

  try {
    const result = await generateWithFallback({ prompt, isJson: true });
    
    if (!result) {
        throw new Error('AI model failed to generate a response.');
    }

    const parsedResult = JSON.parse(result);
    const validatedResult = CategorizeExpenseOutputSchema.safeParse(parsedResult);
    
    if (!validatedResult.success) {
        console.error("AI response validation error:", validatedResult.error);
        throw new Error('AI response validation failed.');
    }
    
    return validatedResult.data;

  } catch (error) {
    console.error(`AI categorization failed for description "${description}":`, error);
    throw new Error(
      `AI categorization failed. Details: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

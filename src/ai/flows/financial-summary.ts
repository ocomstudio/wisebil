'use server';

import { z } from 'zod';
import { generateWithFallback } from '@/lib/ai-service';

export const FinancialSummaryInputSchema = z.object({
  income: z.number().describe('Total income for the period.'),
  expenses: z.number().describe('Total expenses for the period.'),
  expensesByCategory: z
    .array(
      z.object({
        name: z.string(),
        amount: z.number(),
      })
    )
    .describe('An array of expense categories with their total amounts.'),
  language: z.string().describe("The user's preferred language (e.g., 'fr', 'en')."),
  currency: z.string().describe("The user's preferred currency (e.g., 'XOF', 'EUR', 'USD')."),
});
export type FinancialSummaryInput = z.infer<typeof FinancialSummaryInputSchema>;

export const FinancialSummaryOutputSchema = z.object({
  summary: z.string().describe("A concise, encouraging summary of the user's financial situation. It should be one or two sentences long. Be direct and human."),
  advice: z.string().describe('A single, actionable piece of advice to help the user improve their financial habits. It should be one sentence long. Be direct, positive, and human.'),
});
export type FinancialSummaryOutput = z.infer<typeof FinancialSummaryOutputSchema>;

export async function getFinancialSummary(input: FinancialSummaryInput): Promise<FinancialSummaryOutput> {
  if (input.income === 0 && input.expenses === 0) {
    if (input.language === 'fr') {
      return {
        summary: 'Bienvenue ! Ajoutez vos premières transactions pour voir votre résumé financier ici.',
        advice: 'Commencez par enregistrer une dépense ou un revenu pour prendre le contrôle de vos finances.',
      };
    } else {
      return {
        summary: 'Welcome! Add your first transactions to see your financial summary here.',
        advice: 'Start by recording an expense or income to take control of your finances.',
      };
    }
  }

  const { income, expenses, expensesByCategory, language, currency } = input;
  
  const expensesByCategoryString = expensesByCategory.map(e => `- ${e.name}: ${e.amount} ${currency}`).join('\n');

  const prompt = `You are a friendly and encouraging financial advisor. Your goal is to analyze the user's financial data and provide a simple, positive summary and one actionable piece of advice.
                  
Your tone must be human, simple, and direct. The user should feel motivated and positive after reading your message. The summary should be one or two sentences MAX. The advice must be one sentence MAX.

You MUST speak in the user's specified language: ${language}.
You MUST respond ONLY with a JSON object conforming to the output schema.

Output schema:
{
  "summary": "string",
  "advice": "string"
}

User's financial data:
- Total Income: ${income} ${currency}
- Total Expenses: ${expenses} ${currency}
- Expenses by Category:
${expensesByCategoryString}
`;

  try {
    const result = await generateWithFallback({ prompt, isJson: true });
    
    if (!result) {
      throw new Error('AI model failed to generate a response.');
    }

    const parsedResult = JSON.parse(result);
    const validatedResult = FinancialSummaryOutputSchema.safeParse(parsedResult);
    
    if (!validatedResult.success) {
      console.error("AI response validation error:", validatedResult.error);
      throw new Error('AI response validation failed.');
    }
    
    return validatedResult.data;

  } catch (error) {
    console.error('Failed to get financial summary:', error);
    throw new Error(
      `Failed to get financial summary. Details: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

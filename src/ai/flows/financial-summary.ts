// src/ai/flows/financial-summary.ts
'use server';

/**
 * @fileOverview Financial summary AI flow.
 *
 * - getFinancialSummary - A function that generates a financial summary and advice.
 * - FinancialSummaryInput - The input type for the getFinancialSummary function.
 * - FinancialSummaryOutput - The return type for the getFinancialSummary function.
 */

import {ai} from '@/lib/genkit';
import {z} from 'genkit';
import {generateWithTool} from '@/lib/ai-service';
import {
    FinancialSummaryInputSchema,
    FinancialSummaryOutputSchema,
} from '@/types/ai-schemas';
export type { FinancialSummaryInput, FinancialSummaryOutput } from '@/types/ai-schemas';

const financialSummaryTool = ai.defineTool(
    {
      name: 'getFinancialSummary',
      description: 'Provides a financial summary and advice based on income and expenses.',
      inputSchema: FinancialSummaryInputSchema,
      outputSchema: FinancialSummaryOutputSchema,
    },
    async (input) => {
        // This is a mock implementation. The actual logic is handled by the LLM.
      return {
        summary: 'Financial summary based on input.',
        advice: 'Financial advice based on input.',
      };
    }
  );

export async function getFinancialSummary(
  input: z.infer<typeof FinancialSummaryInputSchema>
): Promise<z.infer<typeof FinancialSummaryOutputSchema>> {
  const {income, expenses, expensesByCategory, language, currency} = input;
  // Handle the case where there is no financial data yet.
  if (income === 0 && expenses === 0) {
    if (language === 'fr') {
      return {
        summary:
          'Bienvenue ! Ajoutez vos premières transactions pour voir votre résumé financier ici.',
        advice:
          'Commencez par enregistrer une dépense ou un revenu pour prendre le contrôle de vos finances.',
      };
    } else {
      return {
        summary:
          'Welcome! Add your first transactions to see your financial summary here.',
        advice:
          'Start by recording an expense or income to take control of your finances.',
      };
    }
  }

  const expensesByCategoryString = expensesByCategory
    .map((e) => `- ${e.name}: ${e.amount} ${currency}`)
    .join('\n');

  const systemPrompt = `You are a friendly and encouraging financial advisor. Your goal is to analyze the user's financial data and provide a simple, positive summary and one actionable piece of advice.
                  
Your tone must be human, simple, and direct. The user should feel motivated and positive after reading your message. The summary should be one or two sentences MAX. The advice must be one sentence MAX.

You MUST speak in the user's specified language: ${language}.
You MUST respond ONLY with a JSON object conforming to the output schema.

User's financial data:
- Total Income: ${income} ${currency}
- Total Expenses: ${expenses} ${currency}
- Expenses by Category:
${expensesByCategoryString}`;

  const result = await generateWithTool(systemPrompt, input, financialSummaryTool);
  return result;
}

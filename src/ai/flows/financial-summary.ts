'use server';

/**
 * @fileOverview An AI agent that analyzes financial data to provide a summary and advice.
 *
 * - getFinancialSummary - A function that returns a summary and advice based on financial data.
 * - FinancialSummaryInput - The input type for the getFinancialSummary function.
 * - FinancialSummaryOutput - The return type for the getFinancialSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialSummaryInputSchema = z.object({
  income: z.number().describe('Total income for the period.'),
  expenses: z.number().describe('Total expenses for the period.'),
  expensesByCategory: z.array(z.object({
    name: z.string(),
    amount: z.number(),
  })).describe('An array of expense categories with their total amounts.'),
});
export type FinancialSummaryInput = z.infer<typeof FinancialSummaryInputSchema>;

const FinancialSummaryOutputSchema = z.object({
  summary: z.string().describe("A concise, encouraging summary of the user's financial situation. It should be one or two sentences long."),
  advice: z.string().describe("A single, actionable piece of advice to help the user improve their financial habits. It should be one sentence long."),
});
export type FinancialSummaryOutput = z.infer<typeof FinancialSummaryOutputSchema>;

export async function getFinancialSummary(input: FinancialSummaryInput): Promise<FinancialSummaryOutput> {
  return financialSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialSummaryPrompt',
  input: {schema: FinancialSummaryInputSchema},
  output: {schema: FinancialSummaryOutputSchema},
  prompt: `You are a friendly and encouraging financial advisor for the Wisebil app. Your goal is to analyze the user's financial data and provide a simple, positive summary and one actionable piece of advice. Speak in French.

  Financial Data:
  - Total Income: {{{income}}} FCFA
  - Total Expenses: {{{expenses}}} FCFA
  - Expenses by Category:
  {{#each expensesByCategory}}
    - {{name}}: {{amount}} FCFA
  {{/each}}

  Based on this data, provide:
  1.  A short, positive summary of their financial activity. For example, if they spent less than they earned, congratulate them. If not, be encouraging about taking control.
  2.  One clear, simple, and actionable piece of advice. Focus on the largest spending category or the relationship between income and expenses.

  Example Output:
  {
    "summary": "Excellent ! Ce mois-ci, vos revenus ont dépassé vos dépenses. C'est une superbe gestion !",
    "advice": "Votre plus gros poste de dépense est l'Alimentation; cherchez des recettes économiques pour optimiser ce budget."
  }

  Respond ONLY with a JSON object conforming to the schema.
  `,
});

const financialSummaryFlow = ai.defineFlow(
  {
    name: 'financialSummaryFlow',
    inputSchema: FinancialSummaryInputSchema,
    outputSchema: FinancialSummaryOutputSchema,
  },
  async input => {
    // Avoid calling the AI if there's no data to analyze
    if (input.income === 0 && input.expenses === 0) {
      return {
        summary: "Bienvenue ! Ajoutez vos premières transactions pour voir votre résumé financier ici.",
        advice: "Commencez par enregistrer une dépense ou un revenu pour prendre le contrôle de vos finances."
      };
    }

    const {output} = await prompt(input);
    return output!;
  }
);

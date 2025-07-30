'use server';

/**
 * @fileOverview An AI agent that analyzes financial data to provide a summary and advice.
 *
 * - getFinancialSummary - A function that returns a summary and advice based on financial data.
 * - FinancialSummaryInput - The input type for the getFinancialSummary function.
 * - FinancialSummaryOutput - The return type for the getFinancialSummary function.
 */

import { z } from 'zod';
import { openai } from '@/lib/openai';

const FinancialSummaryInputSchema = z.object({
  income: z.number().describe('Total income for the period.'),
  expenses: z.number().describe('Total expenses for the period.'),
  expensesByCategory: z.array(z.object({
    name: z.string(),
    amount: z.number(),
  })).describe('An array of expense categories with their total amounts.'),
  language: z.string().describe("The user's preferred language (e.g., 'fr', 'en')."),
  currency: z.string().describe("The user's preferred currency (e.g., 'XOF', 'EUR', 'USD')."),
});
export type FinancialSummaryInput = z.infer<typeof FinancialSummaryInputSchema>;

const FinancialSummaryOutputSchema = z.object({
  summary: z.string().describe("A concise, encouraging summary of the user's financial situation. It should be one or two sentences long."),
  advice: z.string().describe("A single, actionable piece of advice to help the user improve their financial habits. It should be one sentence long."),
});
export type FinancialSummaryOutput = z.infer<typeof FinancialSummaryOutputSchema>;

export async function getFinancialSummary(input: FinancialSummaryInput): Promise<FinancialSummaryOutput> {
  const { income, expenses, expensesByCategory, language, currency } = FinancialSummaryInputSchema.parse(input);
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
  }

  // Avoid calling the AI if there's no data to analyze
  if (income === 0 && expenses === 0) {
      if (language === 'fr') {
        return {
          summary: "Bienvenue ! Ajoutez vos premières transactions pour voir votre résumé financier ici.",
          advice: "Commencez par enregistrer une dépense ou un revenu pour prendre le contrôle de vos finances."
        };
      } else {
         return {
          summary: "Welcome! Add your first transactions to see your financial summary here.",
          advice: "Start by recording an expense or income to take control of your finances."
        };
      }
    }

    const expensesByCategoryString = expensesByCategory.map(e => `- ${e.name}: ${e.amount} ${currency}`).join('\n');

    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-chat:free",
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `You are a friendly and encouraging financial advisor for the Wisebil app. Your goal is to analyze the user's financial data and provide a simple, positive summary and one actionable piece of advice.
                    
                    You MUST speak in the user's specified language: ${language}.
                    You MUST respond ONLY with a JSON object conforming to this Zod schema:
                    ${JSON.stringify(FinancialSummaryOutputSchema.shape)}
    
                    Example Output (if language is 'fr'):
                    {
                        "summary": "Excellent ! Ce mois-ci, vos revenus ont dépassé vos dépenses. C'est une superbe gestion !",
                        "advice": "Votre plus gros poste de dépense est l'Alimentation; cherchez des recettes économiques pour optimiser ce budget."
                    }
                    
                    Example Output (if language is 'en'):
                    {
                        "summary": "Excellent! This month, your income exceeded your expenses. That's great management!",
                        "advice": "Your biggest spending category is Food; look for budget-friendly recipes to optimize this budget."
                    }`
                },
                {
                    role: 'user',
                    content: `Here is my financial data:
                    - Total Income: ${income} ${currency}
                    - Total Expenses: ${expenses} ${currency}
                    - Expenses by Category:
                    ${expensesByCategoryString}`
                }
            ]
        });
        
        const result = JSON.parse(completion.choices[0].message.content || '{}');
        return FinancialSummaryOutputSchema.parse(result);
    } catch (error) {
        console.error(`AI model failed to generate a response for financial summary:`, error);
        throw new Error(`AI model failed to generate a response. Details: ${error instanceof Error ? error.message : String(error)}`);
    }
}

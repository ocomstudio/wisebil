// src/ai/flows/financial-summary.ts
'use server';

/**
 * @fileOverview Financial summary AI flow.
 *
 * - getFinancialSummary - A function that generates a financial summary and advice.
 * - FinancialSummaryInput - The input type for the getFinancialSummary function.
 * - FinancialSummaryOutput - The return type for the getFinancialSummary function.
 */

import {
    FinancialSummaryInputSchema,
    FinancialSummaryOutputSchema,
    FinancialSummaryInput,
    FinancialSummaryOutput
} from '@/types/ai-schemas';
import { generate } from '@/services/ai-service';

export type { FinancialSummaryInput, FinancialSummaryOutput };


async function getFinancialSummaryFlow(input: FinancialSummaryInput): Promise<FinancialSummaryOutput> {
    const {income, expenses, expensesByCategory, language, currency} = input;
    
    // Handle the case where there is no financial data yet.
    if (income === 0 && expenses === 0) {
        if (language === 'fr') {
        return {
            summary:
            'Bienvenue ! Ajoutez vos premières transactions pour voir votre résumé financier ici.',
            advice:
            'Commencez par enregistrer une dépense ou un revenu pour prendre le contrôle de vos finances.',
            prediction: "Ajoutez des données pour voir les prédictions."
        };
        } else {
        return {
            summary:
            'Welcome! Add your first transactions to see your financial summary here.',
            advice:
            'Start by recording an expense or income to take control of your finances.',
            prediction: "Add data to see predictions."
        };
        }
    }

    const expensesByCategoryString = expensesByCategory
        .map((e) => `- ${e.name}: ${e.amount} ${currency}`)
        .join('\n');

    const systemPrompt = `You are a friendly and encouraging financial advisor. Your goal is to analyze the user's financial data and provide a simple, positive summary, one actionable piece of advice, and a spending prediction for the next month.
                    
    Your tone must be human, simple, and direct. The user should feel motivated and positive after reading your message. 
    - The summary should be one or two sentences MAX.
    - The advice must be one sentence MAX.
    - The prediction should be a single sentence estimating the total expenses for the next 30 days based on the current data. Start it with "Based on your habits, you might spend around...".

    You MUST speak in the user's specified language: ${language}.
    You MUST respond ONLY with a JSON object conforming to the output schema.

    User's financial data:
    - Total Income: ${income} ${currency}
    - Total Expenses: ${expenses} ${currency}
    - Expenses by Category:
    ${expensesByCategoryString}`;

    const rawOutput = await generate({
        system: systemPrompt,
        prompt: `Based on the provided data, generate a summary, advice, and prediction.`,
        output: {
            format: 'json',
            schema: FinancialSummaryOutputSchema
        }
    });
    
    const output = FinancialSummaryOutputSchema.parse(rawOutput);
    return output;
}


export async function getFinancialSummary(input: FinancialSummaryInput): Promise<FinancialSummaryOutput> {
  return await getFinancialSummaryFlow(input);
}

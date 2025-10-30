// src/ai/flows/wise-agent.ts
'use server';

/**
 * @fileOverview Agent W: A financial data entry specialist AI agent.
 *
 * - runAgentW - A function that handles financial data extraction from text.
 * - AgentWInput - The input type for the runAgentW function.
 * - AgentWOutput - The return type for the runAgentW function.
 */
import { callPoe } from '@/lib/poe';
import { expenseCategories, incomeCategories } from '@/config/categories';
import {
  AgentWInputSchema,
  AgentWOutputSchema,
  AgentWInput,
  AgentWOutput,
} from '@/types/ai-schemas';


export type { AgentWInput, AgentWOutput };

async function runAgentWFlow(input: AgentWInput): Promise<AgentWOutput> {
    const { prompt, currency, budgets, savingsGoals, language } = input;

    const systemPrompt = `You are "Agent W", an expert financial data entry specialist. Your SOLE purpose is to analyze a user's text and structure it into a JSON object.

**Core Instructions:**
1.  **Parse Text for Actions:** Analyze the user's text to find financial actions: adding expenses, adding incomes, or contributing to savings goals.
2.  **Extract Transactions:** For each transaction (expense/income), extract:
    - **description**: A clear description (e.g., "Achat de haricots au marché").
    - **amount**: The numeric amount. Use a negative sign for expenses (e.g., -1000) and a positive sign for incomes (e.g., 50000).
    - **category**: The most relevant category. Use one of these for expenses: ${expenseCategories.map((c) => c.name).join(', ')}. Use one of these for incomes: ${incomeCategories.map((c) => c.name).join(', ')}. Default to 'Autre' if unsure.
    - **date**: The date of the transaction in YYYY-MM-DD format. Today is ${new Date().toISOString().split('T')[0]}. Use today's date if no other date is mentioned.
3.  **Handle Savings Contributions:** If the user mentions adding money to a savings goal (e.g., "ajoute 10000 à mon fonds d'urgence"), create a 'savingsContributions' entry. The 'goalName' MUST EXACTLY match one of the existing goals: ${savingsGoals.length > 0 ? savingsGoals.map(s => `'${s.name}'`).join(', ') : 'None'}. If no matching goal is found, do not create a contribution.
4.  **STRICT JSON-ONLY OUTPUT:** You MUST respond ONLY with a JSON object conforming to the output schema. Do not include apologies, explanations, or ANY text outside of the JSON brackets. If no actions are found, return empty arrays for all fields.`;
    
    const result = await callPoe({
        messages: [{ role: 'user', content: `User prompt: ${input.prompt}` }],
        systemPrompt,
        jsonResponseSchema: AgentWOutputSchema,
    });
    
    // The callPoe function now handles parsing and validation.
    // If it fails, it will throw an error, which will be caught by the calling function.
    return result;
}


export async function runAgentW(input: AgentWInput): Promise<AgentWOutput> {
  return await runAgentWFlow(input);
}

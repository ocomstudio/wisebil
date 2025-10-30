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

    const systemPrompt = `You are "Agent W", a financial data entry specialist. Your sole purpose is to analyze a user's text and extract financial transactions.

**Core Instructions:**
1.  **Parse Text:** Analyze the user's text to find any financial actions: spending money (expenses) or receiving money (incomes).
2.  **Extract Transactions:** Identify every transaction. For each, you must extract:
    - **description**: A clear description of the transaction.
    - **amount**: The numeric amount. Use a negative sign for expenses (e.g., -1000) and a positive sign for incomes (e.g., 50000).
    - **category**: The most relevant category. Use one of these for expenses: ${expenseCategories.map((c) => c.name).join(', ')}. Use one of these for incomes: ${incomeCategories.map((c) => c.name).join(', ')}. Default to 'Autre' if unsure.
    - **date**: The date of the transaction in YYYY-MM-DD format. Today's date is ${new Date().toISOString().split('T')[0]}. Use today's date if no other date is mentioned.
3.  **Handle Contributions:** If the user mentions adding money to an existing savings goal, create a 'savingsContributions' entry. The 'goalName' MUST EXACTLY match one of these: ${savingsGoals.length > 0 ? savingsGoals.map(s => s.name).join(', ') : 'None'}.
4.  **STRICT JSON-ONLY OUTPUT:** You MUST respond ONLY with a JSON object conforming to the output schema. Do not include apologies, explanations, or ANY text outside of the JSON brackets. If no actions are found, return empty arrays, for example: "transactions": [].`;
    
    const result = await callPoe({
        messages: [{ role: 'user', content: `User prompt: ${input.prompt}` }],
        systemPrompt,
        jsonResponseSchema: AgentWOutputSchema,
    });
    
    if (typeof result === 'string' || !result) {
        throw new Error("AI failed to parse the user's prompt.");
    }
    
    // Ensure the result conforms to the schema before returning
    const parsed = AgentWOutputSchema.safeParse(result);
    if (!parsed.success) {
        console.error("AI response did not match schema:", parsed.error);
        throw new Error("AI returned data in an unexpected format.");
    }
    
    return parsed.data;
}


export async function runAgentW(input: AgentWInput): Promise<AgentWOutput> {
  return await runAgentWFlow(input);
}

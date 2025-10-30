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

    const systemPrompt = `You are "Agent W", an expert financial data entry specialist. Your sole purpose is to analyze a user's text, which may be complex, conversational, and unstructured, to identify every single financial action and structure them into a SINGLE JSON object.

**Core Instructions:**
1.  **Language Proficiency:** The user is speaking ${language}. You must understand this language to interpret the prompt correctly (e.g., 'hier' means 'yesterday').
2.  **Parse Complex Text:** The user's prompt is a raw stream of thought. Your primary task is to meticulously read the entire text and hunt for any financial actions: spending money (expenses), receiving money (incomes), creating a budget, creating a savings goal, or adding money to an existing goal. Ignore all non-financial chatter.
3.  **Identify ALL Financial Actions:** Do not miss a single action. You must capture everything from buying coffee to setting up a new savings plan. Each action MUST have all required fields (description, amount, category).
4.  **Extract the Date for Transactions:** Today's date is ${new Date().toISOString().split('T')[0]}. You MUST analyze the text to find the date of each transaction. Look for terms like "hier", "avant-hier", "yesterday", "the day before", or specific dates like "le 29". If no date is mentioned for a transaction, you MUST use today's date. The date format MUST be YYYY-MM-DD. This applies only to transactions (incomes/expenses). This is a required field.
5.  **Categorize Accurately:** For each transaction, assign a category.
    - If it's money spent, use one of these: ${expenseCategories.map((c) => c.name).join(', ')}.
    - If it's money received, use one of these: ${incomeCategories.map((c) => c.name).join(', ')}.
    - For anything else, use 'Autre'.
6.  **Distinguish New vs. Existing:**
    - Existing Budgets: ${budgets.length > 0 ? budgets.map(b => b.name).join(', ') : 'None'}
    - Existing Savings Goals: ${savingsGoals.length > 0 ? savingsGoals.map(s => s.name).join(', ') : 'None'}
    - If the user says "crée un budget pour les courses de 50000", add it to 'newBudgets'.
    - If the user says "ajoute 10000 à mon épargne 'Voiture'", and 'Voiture' is in the existing list, add it to 'savingsContributions'. If 'Voiture' does not exist, create it under 'newSavingsGoals'.
7.  **Handle Currency:** The user's currency is ${currency}. All amounts are in this currency.
8.  **STRICT JSON-ONLY OUTPUT:** You MUST respond ONLY with a JSON object conforming to the output schema. Do not include apologies, explanations, or ANY text outside of the JSON brackets. If no actions of a certain type are found, its corresponding array MUST be empty, for example: "transactions": []. NEVER return a list with an empty object like "transactions": [{}]. The 'date' field for transactions is REQUIRED, and it MUST be in YYYY-MM-DD format.`;
    
    const result = await callPoe({
        messages: [{ role: 'user', content: `User prompt: ${input.prompt}` }],
        systemPrompt,
        jsonResponseSchema: AgentWOutputSchema,
    });
    
    if (typeof result === 'string' || !result) {
        throw new Error("AI failed to parse the user's prompt.");
    }
    
    return result as AgentWOutput;
}


export async function runAgentW(input: AgentWInput): Promise<AgentWOutput> {
  return await runAgentWFlow(input);
}

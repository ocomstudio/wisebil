// src/ai/flows/wise-agent.ts
'use server';

/**
 * @fileOverview An AI agent that parses a natural language text to extract and structure financial transactions, budgets, and savings goals.
 *
 * - runAgentW - A function that takes a user's prompt and returns a structured list of financial actions.
 * - AgentWInput - The input type for the runAgentW function.
 * - AgentWOutput - The return type for the runAgentW function.
 */

import { z } from 'zod';
import { openai } from '@/lib/openai';
import { expenseCategories, incomeCategories } from '@/config/categories';
import type { Budget } from '@/types/budget';
import type { SavingsGoal } from '@/types/savings-goal';

const TransactionSchema = z.object({
  description: z.string().describe("The detailed description of the transaction."),
  amount: z.number().describe("The numeric amount of the transaction."),
  category: z.string().describe("The most relevant category for the transaction."),
  date: z.string().optional().describe("The date of the transaction in YYYY-MM-DD format. If not specified, it's today."),
});

const NewBudgetSchema = z.object({
    name: z.string().describe("The name for the new budget."),
    amount: z.number().describe("The allocated amount for the budget."),
    category: z.string().describe("The expense category for the budget."),
});

const NewSavingsGoalSchema = z.object({
    name: z.string().describe("The name for the new savings goal."),
    targetAmount: z.number().describe("The target amount for the savings goal."),
    currentAmount: z.number().optional().default(0).describe("The starting amount, defaults to 0."),
});

const SavingsContributionSchema = z.object({
    goalName: z.string().describe("The name of the existing savings goal to contribute to."),
    amount: z.number().describe("The amount to add to the savings goal."),
});


const AgentWInputSchema = z.object({
  prompt: z.string().describe("The user's text describing their daily financial activities."),
  currency: z.string().describe("The user's currency to provide context for amounts."),
  budgets: z.array(z.any()).describe("List of existing user budgets."),
  savingsGoals: z.array(z.any()).describe("List of existing user savings goals."),
});
export type AgentWInput = z.infer<typeof AgentWInputSchema>;

const AgentWOutputSchema = z.object({
  incomes: z.array(TransactionSchema).optional().default([]).describe("A list of all income transactions found."),
  expenses: z.array(TransactionSchema).optional().default([]).describe("A list of all expense transactions found."),
  newBudgets: z.array(NewBudgetSchema).optional().default([]).describe("A list of new budgets to be created."),
  newSavingsGoals: z.array(NewSavingsGoalSchema).optional().default([]).describe("A list of new savings goals to be created."),
  savingsContributions: z.array(SavingsContributionSchema).optional().default([]).describe("A list of contributions to existing savings goals."),
});
export type AgentWOutput = z.infer<typeof AgentWOutputSchema>;

export async function runAgentW(input: AgentWInput): Promise<string> {
  const { prompt, currency, budgets, savingsGoals } = AgentWInputSchema.parse(input);
  const today = new Date().toISOString().split('T')[0];

  const validExpenseCategories = expenseCategories.map(c => c.name).join(', ');
  const validIncomeCategories = incomeCategories.map(c => c.name).join(', ');
  const existingBudgets = budgets.map(b => b.name).join(', ') || 'None';
  const existingSavingsGoals = savingsGoals.map(s => s.name).join(', ') || 'None';

  try {
    const completion = await openai.chat.completions.create({
      model: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
      response_format: { type: 'json_object' },
      messages: [
        {
          role: "system",
          content: `You are "Agent W", an expert financial data entry specialist. Your sole purpose is to analyze a user's text, which may be complex, conversational, and unstructured, to identify every single financial action and structure them into a SINGLE JSON object.

          **Core Instructions:**
          1.  **Parse Complex Text:** The user's prompt is a raw stream of thought. Your primary task is to meticulously read the entire text and hunt for any financial actions: spending money (expenses), receiving money (incomes), creating a budget, creating a savings goal, or adding money to an existing goal. Ignore all non-financial chatter.
          2.  **Identify ALL Financial Actions:** Do not miss a single action. You must capture everything from buying coffee to setting up a new savings plan.
          3.  **Extract the Date for Transactions:** Today's date is ${today}. You MUST analyze the text to find the date of each transaction. Look for terms like "hier", "avant-hier", or specific dates like "le 29". If no date is mentioned for a transaction, you MUST use today's date (${today}). The date format MUST be YYYY-MM-DD. This applies only to incomes and expenses.
          4.  **Categorize Accurately:** For each transaction, assign a category.
              - **Expenses (money spent):** Use one of these: ${validExpenseCategories}.
              - **Incomes (money received):** Use one of these: ${validIncomeCategories}.
          5.  **Distinguish New vs. Existing:**
              - Existing Budgets: ${existingBudgets}
              - Existing Savings Goals: ${existingSavingsGoals}
              - If the user says "crée un budget pour les courses de 50000", add it to 'newBudgets'.
              - If the user says "ajoute 10000 à mon épargne 'Voiture'", and 'Voiture' is in the existing list, add it to 'savingsContributions'. If 'Voiture' does not exist, create it under 'newSavingsGoals'.
          6.  **Handle Currency:** The user's currency is ${currency}. All amounts are in this currency.
          7.  **STRICT JSON-ONLY OUTPUT:** You MUST respond ONLY with a JSON object conforming to the Zod schema below. Do not include apologies, explanations, or ANY text outside of the JSON brackets. If no actions of a certain type are found, its corresponding array MUST be empty, for example: "incomes": [].

          **Example of complex analysis:**
          User Prompt: "Ok, today was crazy. I received my salary of 500000. Yesterday, I went to the supermarket and spent 25000 on groceries, then I grabbed a taxi for 3500. I also want to set a new budget for entertainment of 20000. Oh, and put 15000 towards my 'New Car' savings goal."
          (Assuming today is 2024-07-30 and 'New Car' is an existing goal)
          Expected JSON Output:
          {
            "incomes": [
              { "description": "Salary", "amount": 500000, "category": "Salaire", "date": "2024-07-30" }
            ],
            "expenses": [
              { "description": "Groceries at supermarket", "amount": 25000, "category": "Alimentation", "date": "2024-07-29" },
              { "description": "Taxi ride", "amount": 3500, "category": "Transport", "date": "2024-07-29" }
            ],
            "newBudgets": [
              { "name": "Entertainment", "amount": 20000, "category": "Divertissement" }
            ],
            "newSavingsGoals": [],
            "savingsContributions": [
              { "goalName": "New Car", "amount": 15000 }
            ]
          }
          
          Zod Schema for your output:
          ${JSON.stringify(AgentWOutputSchema.shape)}
          `
        },
        {
          role: "user",
          content: `Here is my day, please analyze it: ${prompt}`
        }
      ],
    });

    return completion.choices[0].message.content || '{}';

  } catch (error) {
    console.error(`Agent W failed to generate a response:`, error);
    throw new Error(`Agent W failed to generate a response. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
}

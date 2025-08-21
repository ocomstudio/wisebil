// src/types/ai-schemas.ts
import { z } from 'zod';
import type { Budget } from './budget';
import type { SavingsGoal } from './savings-goal';
import type { Transaction } from './transaction';


// Schema for categorize-expense.ts
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


// Schema for financial-summary.ts
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


// Schema for wise-agent.ts
const TransactionSchemaForAgent = z.object({
  description: z.string().describe('The detailed description of the transaction.'),
  amount: z.number().describe('The numeric amount of the transaction.'),
  category: z.string().describe('The most relevant category for the transaction.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.").describe("The date of the transaction in YYYY-MM-DD format. This is required."),
});

const NewBudgetSchema = z.object({
  name: z.string().describe('The name for the new budget.'),
  amount: z.number().describe('The allocated amount for the budget.'),
  category: z.string().describe('The expense category for the budget.'),
});

const NewSavingsGoalSchema = z.object({
  name: z.string().describe('The name for the new savings goal.'),
  targetAmount: z.number().describe('The target amount for the savings goal.'),
  currentAmount: z.number().optional().default(0).describe('The starting amount, defaults to 0.'),
  emoji: z.string().optional().describe("An optional emoji for the goal.")
});

const SavingsContributionSchema = z.object({
  goalName: z.string().describe('The name of the existing savings goal to contribute to.'),
  amount: z.number().describe('The amount to add to the savings goal.'),
});

export const AgentWInputSchema = z.object({
  prompt: z.string().describe("The user's text describing their daily financial activities."),
  currency: z.string().describe("The user's currency to provide context for amounts."),
  budgets: z.array(z.any()).describe('List of existing user budgets.'),
  savingsGoals: z.array(z.any()).describe('List of existing user savings goals.'),
});
export type AgentWInput = z.infer<typeof AgentWInputSchema>;

export const AgentWOutputSchema = z.object({
  incomes: z.array(TransactionSchemaForAgent).optional().default([]).describe('A list of all income transactions found.'),
  expenses: z.array(TransactionSchemaForAgent).optional().default([]).describe('A list of all expense transactions found.'),
  newBudgets: z.array(NewBudgetSchema).optional().default([]).describe('A list of new budgets to be created.'),
  newSavingsGoals: z.array(NewSavingsGoalSchema).optional().default([]).describe('A list of new savings goals to be created.'),
  savingsContributions: z.array(SavingsContributionSchema).optional().default([]).describe('A list of contributions to existing savings goals.'),
});
export type AgentWOutput = z.infer<typeof AgentWOutputSchema>;


// Schema for expense-assistant.ts
const FinancialDataSchema = z.object({
  income: z.number().optional(),
  expenses: z.number().optional(),
  transactions: z.array(z.custom<Transaction>()).optional(),
  budgets: z.array(z.custom<Budget>()).optional(),
  savingsGoals: z.array(z.custom<SavingsGoal>()).optional(),
});

export const ExpenseAssistantInputSchema = z.object({
  question: z.string().describe("The user's question about their finances."),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .describe('The previous conversation history between the user and the assistant.'),
  language: z.string().describe("The user's preferred language (e.g., 'fr', 'en')."),
  currency: z.string().describe("The user's preferred currency (e.g., 'XOF', 'EUR', 'USD')."),
  financialData: FinancialDataSchema.describe("The user's complete financial data for context."),
  userName: z.string().describe("The user's name."),
});

export type ExpenseAssistantInput = z.infer<typeof ExpenseAssistantInputSchema>;

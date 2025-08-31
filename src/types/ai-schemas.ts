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
  prediction: z.string().describe("A single sentence predicting the user's spending for the next month based on current habits."),
});
export type FinancialSummaryOutput = z.infer<typeof FinancialSummaryOutputSchema>;


// Schema for wise-agent.ts
export const AgentWTransactionSchema = z.object({
  description: z.string().describe('The detailed description of the transaction.'),
  amount: z.number().describe('The numeric amount of the transaction. Use a negative sign for expenses (e.g., -5000) and a positive sign for incomes (e.g., 10000).'),
  category: z.string().describe('The most relevant category for the transaction.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.").describe("The date of the transaction in YYYY-MM-DD format. This is required."),
});
export type AgentWTransaction = z.infer<typeof AgentWTransactionSchema>;


export const AgentWNewBudgetSchema = z.object({
  name: z.string().describe('The name for the new budget.'),
  amount: z.number().describe('The allocated amount for the budget.'),
  category: z.string().describe('The expense category for the budget.'),
});
export type AgentWNewBudget = z.infer<typeof AgentWNewBudgetSchema>;


export const AgentWNewSavingsGoalSchema = z.object({
  name: z.string().describe('The name for the new savings goal.'),
  targetAmount: z.number().describe('The target amount for the savings goal.'),
  currentAmount: z.number().optional().default(0).describe('The starting amount, defaults to 0.'),
  emoji: z.string().optional().describe("An optional emoji for the goal.")
});
export type AgentWNewSavingsGoal = z.infer<typeof AgentWNewSavingsGoalSchema>;

const SavingsContributionSchema = z.object({
  goalName: z.string().describe('The name of the existing savings goal to contribute to.'),
  amount: z.number().describe('The amount to add to the savings goal.'),
});

export const AgentWInputSchema = z.object({
  prompt: z.string().describe("The user's text describing their daily financial activities."),
  currency: z.string().describe("The user's currency to provide context for amounts."),
  budgets: z.array(z.any()).describe('List of existing user budgets.'),
  savingsGoals: z.array(z.any()).describe('List of existing user savings goals.'),
  language: z.string().describe("The user's preferred language (e.g., 'fr', 'en')."),
});
export type AgentWInput = z.infer<typeof AgentWInputSchema>;

export const AgentWOutputSchema = z.object({
  transactions: z.array(AgentWTransactionSchema).optional().default([]).describe('A list of all financial transactions found. Do not separate into income/expense. Use negative amounts for expenses.'),
  newBudgets: z.array(AgentWNewBudgetSchema).optional().default([]).describe('A list of new budgets to be created.'),
  newSavingsGoals: z.array(AgentWNewSavingsGoalSchema).optional().default([]).describe('A list of new savings goals to be created.'),
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
    .array(z.object({ role: z.enum(['user', 'assistant', 'model']), content: z.string() }))
    .describe('The previous conversation history between the user and the assistant.'),
  language: z.string().describe("The user's preferred language (e.g., 'fr', 'en')."),
  currency: z.string().describe("The user's preferred currency (e.g., 'XOF', 'EUR', 'USD')."),
  financialData: FinancialDataSchema.describe("The user's complete financial data for context."),
  userName: z.string().describe("The user's name."),
});

export type ExpenseAssistantInput = z.infer<typeof ExpenseAssistantInputSchema>;

// Schema for process-receipt-flow.ts
export const ProcessReceiptInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ProcessReceiptInput = z.infer<typeof ProcessReceiptInputSchema>;

export const ProcessReceiptOutputSchema = z.object({
    merchantName: z.string().describe("The name of the merchant or store from the receipt."),
    amount: z.number().describe("The total amount of the transaction from the receipt."),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.").describe("The date of the transaction from the receipt in YYYY-MM-DD format."),
    category: z.string().describe("A suggested expense category based on the merchant name or items."),
});
export type ProcessReceiptOutput = z.infer<typeof ProcessReceiptOutputSchema>;

// Schema for scan-document-flow.ts
export const ScanDocumentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a document (receipt, note, etc.), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ScanDocumentInput = z.infer<typeof ScanDocumentInputSchema>;


// Schema for transcribe-audio.ts
export const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A base64 encoded audio file as a data URI."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

export const TranscribeAudioOutputSchema = z.object({
    transcript: z.string().describe("The transcribed text from the audio."),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

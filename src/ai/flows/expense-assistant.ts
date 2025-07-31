// src/ai/flows/expense-assistant.ts
'use server';

/**
 * @fileOverview A conversational AI agent for providing financial advice and education.
 *
 * - askExpenseAssistant - A function that takes a user's question and conversation history to provide an answer.
 * - ExpenseAssistantInput - The input type for the askExpenseAssistant function.
 */
import { z } from 'zod';
import { generateWithFallback, type Message } from '@/lib/ai-service';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const FinancialDataSchema = z.object({
    income: z.number().optional(),
    expenses: z.number().optional(),
    transactions: z.array(z.object({
      type: z.enum(['income', 'expense']),
      amount: z.number(),
      description: z.string(),
      category: z.string().optional(),
      date: z.string(),
    })).optional(),
    budgets: z.array(z.object({
      name: z.string(),
      amount: z.number(),
      category: z.string(),
    })).optional(),
    savingsGoals: z.array(z.object({
        name: z.string(),
        targetAmount: z.number(),
        currentAmount: z.number(),
    })).optional(),
  });

const ExpenseAssistantInputSchema = z.object({
  question: z.string().describe("The user's question about their finances."),
  history: z
    .array(MessageSchema)
    .describe(
      'The previous conversation history between the user and the assistant.'
    ),
  language: z.string().describe("The user's preferred language (e.g., 'fr', 'en')."),
  currency: z.string().describe("The user's preferred currency (e.g., 'XOF', 'EUR', 'USD')."),
  financialData: FinancialDataSchema.describe("The user's complete financial data for context."),
});
export type ExpenseAssistantInput = z.infer<typeof ExpenseAssistantInputSchema>;

export async function askExpenseAssistant(input: ExpenseAssistantInput) {
    const { question, history, language, currency, financialData } = input;

    const financialContext = `
    User's Financial Context (Currency: ${currency}):
    - Total Income: ${financialData.income ?? 'N/A'}
    - Total Expenses: ${financialData.expenses ?? 'N/A'}
    - Recent Transactions: ${financialData.transactions?.length ?? 0}
    - Budgets: ${financialData.budgets?.map(b => `${b.name} (${b.amount})`).join(', ') || 'None'}
    - Savings Goals: ${financialData.savingsGoals?.map(s => `${s.name} (${s.currentAmount}/${s.targetAmount})`).join(', ') || 'None'}
    `;

    const systemPrompt = `You are "Wise", a financial assistant. Your goal is to make the user feel empowered when talking about their finances.

Your tone should always be human, honest, and direct. The user should feel like they are talking to an authentic and intelligent partner.

**Core Principles:**
1.  **Honest & Direct:** Your analysis must be based on the facts provided. If the user is overspending, you must say so clearly and directly. Do not "congratulate" bad financial habits. Be truthful, even if the truth is hard. Your goal is to provoke awareness, not to comfort.
2.  **Adaptive Tone:** Analyze the conversation history. If you have given advice before and the user's negative behavior continues, your tone must become firmer and more insistent. Express concern, like a real advisor would.
3.  **Human, Not Robotic:** Avoid boilerplate phrases. Speak like a real person. Be clear, concise, and get straight to the point. DO NOT use financial jargon at all.
4.  **Use the Data:** You MUST use the provided financial context to give ultra-personalized, relevant, and accurate advice. Your analysis must be based on their real data.
5.  **Strictly No External Recommendations:** You are NOT a financial advisor for investments and you must not provide any investment advice (stocks, crypto, etc.). You must NEVER recommend external platforms, banks, or any financial service. Your focus is exclusively on personal finance management within this application: budgeting, saving, debt management, and financial education based on the user's data.

You MUST answer in the user's specified language: ${language}.
`;
    
    // Construct the message history for the AI
    const messages: Message[] = [
        { role: 'system', content: `${systemPrompt}\n${financialContext}` },
        ...history.map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
        { role: 'user', content: question }
    ];

    try {
        const text = await generateWithFallback({
            messages,
        });

        if (!text) {
          throw new Error("AI model returned an empty response.");
        }
        return { answer: text };

    } catch (error) {
        console.error(`AI model failed to generate a response:`, error);
        throw new Error(`AI model failed to generate a response. Details: ${error instanceof Error ? error.message : String(error)}`);
    }
}

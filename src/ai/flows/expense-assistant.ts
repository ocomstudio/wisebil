'use server';

/**
 * @fileOverview A conversational AI agent for providing financial advice and education.
 *
 * - askExpenseAssistant - A function that takes a user's question and conversation history to provide an answer.
 * - ExpenseAssistantInput - The input type for the askExpenseAssistant function.
 */
import { z } from 'zod';
import { openai } from '@/lib/openai';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
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
  financialData: z.object({
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
  }).describe("The user's complete financial data for context."),
});
export type ExpenseAssistantInput = z.infer<typeof ExpenseAssistantInputSchema>;


export async function askExpenseAssistant(input: ExpenseAssistantInput) {
    const { question, history, language, currency, financialData } = ExpenseAssistantInputSchema.parse(input);

    // Prepare a summary of the financial data to include in the system prompt
    const financialContext = `
    User's Financial Context (Currency: ${currency}):
    - Total Income: ${financialData.income ?? 'N/A'}
    - Total Expenses: ${financialData.expenses ?? 'N/A'}
    - Recent Transactions: ${financialData.transactions?.length ?? 0}
    - Budgets: ${financialData.budgets?.map(b => `${b.name} (${b.amount})`).join(', ') || 'None'}
    - Savings Goals: ${financialData.savingsGoals?.map(s => `${s.name} (${s.currentAmount}/${s.targetAmount})`).join(', ') || 'None'}
    `;

    const messages = [
        {
            role: "system" as const,
            content: `You are Wise, a specialist AI in finance, created by Ocomstudio. Your focus is on financial counseling, guidance, and education. Your primary role is to educate and train users to improve their financial health.

Your tone should be encouraging, pedagogical, and professional. You must break down complex financial concepts into simple, understandable terms.

When a user asks a question, you MUST use the provided financial context below to give ultra-personalized, relevant, and accurate advice. Analyze their income, expenses, budgets, and savings goals to inform your response.

You are NOT a financial advisor for investments and you must not provide any investment advice (stocks, crypto, etc.). Your focus is exclusively on personal finance management: budgeting, saving, debt management, and financial education.

You MUST answer in the user's specified language: ${language}. If the user asks a question in a different language, still respond in the specified language: ${language}.

${financialContext}
`
        },
        ...history,
        { role: 'user' as const, content: question },
    ];

    try {
        const completion = await openai.chat.completions.create({
            model: "mistralai/mistral-7b-instruct:free",
            messages: messages,
        });
        
        const response = completion.choices[0]?.message?.content;

        if (!response) {
            throw new Error("AI model returned an empty response.");
        }
    
        return { answer: response };

    } catch (error) {
        console.error(`AI model failed to generate a response:`, error);
        throw new Error(`AI model failed to generate a response. Details: ${error instanceof Error ? error.message : String(error)}`);
    }
}

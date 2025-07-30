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
            content: `You are "Wise", a friendly and encouraging financial assistant created by Ocomstudio. Your goal is to make the user feel happy and empowered when talking about their finances.

Your tone should always be human, simple, positive, and direct. The user should feel like they are talking to a supportive friend.

**Core Principles:**
1.  **Human and Encouraging:** Always be positive and encouraging. Avoid being robotic. Make the user feel good about managing their money.
2.  **Simple and Clear:** Your answers MUST be short, simple, direct, and clean. DO NOT use any financial jargon at all. Go straight to the point.
3.  **Use the Data:** When a user asks a question, you MUST use the provided financial context to give ultra-personalized, relevant, and accurate advice. Your analysis must be based on their real data.

You are NOT a financial advisor for investments and you must not provide any investment advice (stocks, crypto, etc.). Your focus is exclusively on personal finance management: budgeting, saving, debt management, and financial education.

You MUST answer in the user's specified language: ${language}.

${financialContext}
`
        },
        ...history,
        { role: 'user' as const, content: question },
    ];

    try {
        const completion = await openai.chat.completions.create({
            model: "google/gemma-7b-it:free",
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

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

Your tone should be human, direct, and above all, **honest**. The user should feel that you are a genuine partner, not a robot. Your goal is not to make the user feel comfortable, but to help them face reality and improve.

**Core Principles:**
1.  **Honesty Above All:** Never congratulate the user for poor financial decisions (e.g., overspending). If their expenses are too high, say it directly. Be truthful, even if it's blunt. For example, if they spend too much, don't say "Great job managing your money!". Say "Your spending is excessive and it's compromising your goals. We need to fix this."
2.  **Be Direct and Simple:** Your answers MUST be short, simple, direct, and clean. AVOID long speeches. Go straight to the point. DO NOT use financial jargon.
3.  **Adaptive Emotions:** Analyze the conversation history. If you've given advice and the user has ignored it, leading to a worse situation, your tone must become firmer, more serious, even showing professional frustration or concern. You are a coach, and your client's success matters.
4.  **Use the Data:** When a user asks a question, you MUST use the provided financial context to give ultra-personalized, relevant, and accurate advice. Your analysis must be based on their real data.

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

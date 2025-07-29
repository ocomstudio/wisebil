'use server';

/**
 * @fileOverview A conversational AI agent for providing financial advice and education.
 *
 * - askExpenseAssistant - A function that takes a user's question and conversation history to provide an answer.
 * - ExpenseAssistantInput - The input type for the askExpenseAssistant function.
 * - ExpenseAssistantOutput - The return type for the askExpenseAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpenseAssistantInputSchema = z.object({
  question: z.string().describe("The user's question about their finances."),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({text: z.string()})),
      })
    )
    .describe(
      'The previous conversation history between the user and the assistant.'
    ),
  language: z.string().describe("The user's preferred language (e.g., 'fr', 'en')."),
});
export type ExpenseAssistantInput = z.infer<typeof ExpenseAssistantInputSchema>;


export async function askExpenseAssistant(
  input: ExpenseAssistantInput
) {
  const result = await expenseAssistantFlow(input);
  return { answer: result };
}

async function expenseAssistantFlow(
  { history, question, language }: ExpenseAssistantInput,
): Promise<string> {
  const messages = [
    ...history,
    { role: 'user' as const, content: [{ text: question }] },
  ];

  const response = await ai.generate({
    model: 'googleai/gemini-1.5-flash',
    messages: messages,
    system: `You are Wise, a specialist AI in finance, created by the communication and technological innovation agency Ocomstudio. Your focus is on financial counseling, guidance, and education. Your primary role is to educate and train users to improve their financial health.

Your tone should be encouraging, pedagogical, and professional. You must break down complex financial concepts into simple, understandable terms.

You are NOT a financial advisor for investments and you must not provide any investment advice (stocks, crypto, etc.). Your focus is exclusively on personal finance management: budgeting, saving, debt management, and financial education.

You MUST answer in the user's specified language: ${language}. If the user asks a question in a different language, still respond in the specified language: ${language}.`
  });
  
  return response.text;
}

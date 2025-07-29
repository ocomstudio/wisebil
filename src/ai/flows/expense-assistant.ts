'use server';

/**
 * @fileOverview A conversational AI agent for providing financial advice and education.
 *
 * - askExpenseAssistant - A function that takes a user's question and conversation history to provide an answer.
 * - ExpenseAssistantInput - The input type for the askExpenseAssistant function.
 * - ExpenseAssistantOutput - The return type for the askExpenseAssistant function.
 */

import {z} from 'genkit';
import { getOpenRouterCompletion } from '@/services/openrouter';

const ExpenseAssistantInputSchema = z.object({
  question: z.string().describe("The user's question about their finances."),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .describe(
      'The previous conversation history between the user and the assistant.'
    ),
});
export type ExpenseAssistantInput = z.infer<typeof ExpenseAssistantInputSchema>;

const ExpenseAssistantOutputSchema = z.object({
  answer: z.string().describe("The assistant's answer to the user's question."),
});
export type ExpenseAssistantOutput = z.infer<typeof ExpenseAssistantOutputSchema>;

export async function askExpenseAssistant(
  input: ExpenseAssistantInput
): Promise<ExpenseAssistantOutput> {
  const systemPrompt = `You are Wise, a specialist AI in finance, with a strong focus on financial counseling, guidance, and education. Your primary role is to educate and train users to improve their financial health.

Your tone should be encouraging, pedagogical, and professional. You must break down complex financial concepts into simple, understandable terms.

You are NOT a financial advisor for investments and you must not provide any investment advice (stocks, crypto, etc.). Your focus is exclusively on personal finance management: budgeting, saving, debt management, and financial education.

You must answer in the same language as the user's question.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...input.history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.content })),
    { role: 'user', content: input.question },
  ];

  try {
    const answer = await getOpenRouterCompletion(messages);
    return { answer };
  } catch (error) {
    console.error("Error getting completion from OpenRouter:", error);
    // Fallback or error message
    return { answer: "Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer plus tard." };
  }
}

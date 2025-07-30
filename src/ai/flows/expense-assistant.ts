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
});
export type ExpenseAssistantInput = z.infer<typeof ExpenseAssistantInputSchema>;


export async function askExpenseAssistant(input: ExpenseAssistantInput) {
    const { question, history, language } = ExpenseAssistantInputSchema.parse(input);

    const messages = [
        {
            role: "system" as const,
            content: `You are Wise, a specialist AI in finance, created by the communication and technological innovation agency Ocomstudio. Your focus is on financial counseling, guidance, and education. Your primary role is to educate and train users to improve their financial health.

Your tone should be encouraging, pedagogical, and professional. You must break down complex financial concepts into simple, understandable terms.

You are NOT a financial advisor for investments and you must not provide any investment advice (stocks, crypto, etc.). Your focus is exclusively on personal finance management: budgeting, saving, debt management, and financial education.

You MUST answer in the user's specified language: ${language}. If the user asks a question in a different language, still respond in the specified language: ${language}.`
        },
        ...history,
        { role: 'user' as const, content: question },
    ];

    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-chat:free",
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
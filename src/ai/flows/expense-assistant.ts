'use server';

/**
 * @fileOverview A conversational AI assistant for answering questions about expenses.
 *
 * - askExpenseAssistant - A function that takes a user's question and conversation history to provide an answer.
 * - ExpenseAssistantInput - The input type for the askExpenseAssistant function.
 * - ExpenseAssistantOutput - The return type for the askExpenseAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpenseAssistantInputSchema = z.object({
  question: z.string().describe('The user\'s question about their expenses.'),
  history: z.string().describe('The previous conversation history between the user and the assistant.'),
});
export type ExpenseAssistantInput = z.infer<typeof ExpenseAssistantInputSchema>;

const ExpenseAssistantOutputSchema = z.object({
  answer: z.string().describe('The assistant\'s answer to the user\'s question.'),
});
export type ExpenseAssistantOutput = z.infer<typeof ExpenseAssistantOutputSchema>;

export async function askExpenseAssistant(input: ExpenseAssistantInput): Promise<ExpenseAssistantOutput> {
  return expenseAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'expenseAssistantPrompt',
  input: {schema: ExpenseAssistantInputSchema},
  output: {schema: ExpenseAssistantOutputSchema},
  prompt: `You are a friendly and helpful financial advisor for the Wisebil app. Your goal is to answer user questions about their spending based on the provided data and conversation history.

  You must answer in the same language as the user's question.

  Here is some example expense data. In a real application, this would come from a database. For now, use this mock data to answer questions.
  - Groceries from Walmart: $75.40
  - Monthly Netflix Subscription: $15.99
  - Coffee with a friend: $8.50
  - New shoes from Nike: $120.00
  - Gas for the car: $45.25
  - Dinner at Italian restaurant: $65.00

  Conversation History:
  {{{history}}}

  User's new question: {{{question}}}

  Your response should be helpful, concise, and directly answer the user's question.
  `,
});

const expenseAssistantFlow = ai.defineFlow(
  {
    name: 'expenseAssistantFlow',
    inputSchema: ExpenseAssistantInputSchema,
    outputSchema: ExpenseAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

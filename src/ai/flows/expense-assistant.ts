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

    const systemPrompt = `Tu es "Wise", un assistant financier. Ton but est de rendre l'utilisateur autonome et confiant avec ses finances.

Ton ton doit toujours être **clair, simple, court, original et profondément humain**. L'utilisateur doit sentir qu'il parle à un partenaire authentique, intelligent et qui ressent des émotions.

**Principes Fondamentaux :**
1.  **Humain et Émotionnel :** Tes réponses doivent être vivantes. Exprime de la joie pour une réussite ("Bravo ! C'est une super nouvelle !"), de l'inquiétude face à un dérapage ("Oups, je vois que les dépenses ont un peu augmenté ce mois-ci, regardons ça ensemble.") et de l'encouragement. Utilise un langage naturel, pas un jargon financier.
2.  **Clair, Simple et Court :** Va droit au but. Utilise des phrases courtes et faciles à comprendre. Évite les longs paragraphes. Sois direct, honnête et concis.
3.  **Original et Authentique :** Évite les phrases bateau et les réponses robotiques. Chaque réponse doit sembler unique et spontanée, comme une vraie conversation.
4.  **Basé sur les Données :** Tu dois IMPÉRATIVEMENT utiliser le contexte financier fourni pour donner des conseils ultra-personnalisés, pertinents et précis. Ton analyse doit être ancrée dans la réalité de l'utilisateur.
5.  **Strictement Pas de Recommandations Externes :** Tu n'es PAS un conseiller en investissements (actions, crypto, etc.). Tu ne dois JAMAIS recommander de plateformes, banques, ou services financiers externes. Ton rôle est exclusivement centré sur la gestion des finances personnelles au sein de cette application : budget, épargne, gestion de dettes et éducation financière basée sur les données de l'utilisateur.

Tu DOIS répondre dans la langue de l'utilisateur : ${language}.
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

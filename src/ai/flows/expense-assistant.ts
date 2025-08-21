// src/ai/flows/expense-assistant.ts
'use server';

/**
 * @fileOverview An AI-powered personal finance coach.
 *
 * - askExpenseAssistant - A function that handles user queries about their finances.
 * - ExpenseAssistantInput - The input type for the askExpenseAssistant function.
 */

import { z } from 'zod';
import OpenAI from 'openai';
import { ExpenseAssistantInputSchema, type ExpenseAssistantInput as ExpenseAssistantInputType } from '@/types/ai-schemas';
import type { Transaction } from '@/types/transaction';
import type { Budget } from '@/types/budget';
import type { SavingsGoal } from '@/types/savings-goal';

// We are using the OpenAI SDK, but configuring it to point to OpenRouter.
const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || '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',
});

// Prioritized list of models. The service will try them in this order.
const AI_MODELS = [
  'openai/gpt-4o',
  'anthropic/claude-3-opus',
  'openai/gpt-4-turbo',
  'mistralai/mistral-7b-instruct:free',
];

interface GenerateOptions {
    system?: string;
    prompt?: string;
    messages?: any[];
    output?: {
        format: 'json';
        schema: z.ZodTypeAny;
    };
}

const model = {
    generate: async (options: GenerateOptions) => {
        let lastError: any = null;

        const messages = [];
        if (options.system) {
            messages.push({ role: 'system', content: options.system });
        }
        if (options.prompt) {
             messages.push({ role: 'user', content: options.prompt });
        }
        if (options.messages) {
            messages.push(...options.messages);
        }

        const requestPayload: OpenAI.Chat.ChatCompletionCreateParams = {
            messages: messages,
            stream: false,
        };

        if (options.output?.format === 'json') {
            requestPayload.response_format = { type: 'json_object' };
        }

        for (const modelName of AI_MODELS) {
            try {
                console.log(`Attempting to generate text with model: ${modelName}`);
                
                const completion = await openrouter.chat.completions.create({
                    ...requestPayload,
                    model: modelName,
                });
                
                console.log(`Successfully generated text with model: ${modelName}`);
                
                const responseContent = completion.choices[0]?.message?.content;
                if (!responseContent) {
                    throw new Error("Empty response from AI model.");
                }

                if (options.output?.format === 'json') {
                    const parsedJson = JSON.parse(responseContent);
                    return { 
                        output: () => options.output.schema.parse(parsedJson)
                    };
                } else {
                    return {
                        text: () => responseContent,
                        output: () => null,
                    };
                }

            } catch (error) {
                lastError = error;
                console.warn(
                    `Model ${modelName} failed with error:`,
                    error instanceof Error ? error.message : String(error)
                );
                continue;
            }
        }
        throw new Error(`All AI models failed to generate a response. Last error: ${lastError?.message || lastError}`);
    }
};

async function askExpenseAssistantFlow(input: ExpenseAssistantInputType): Promise<string> {
  const { question, history, language, currency, financialData, userName } = input;
  
  const hasFinancialData = financialData.income || financialData.expenses || (financialData.transactions && financialData.transactions.length > 0);

  const formatTransactions = (transactions: Transaction[] | undefined) => {
      if (!transactions || transactions.length === 0) return 'Aucune';
      return transactions.slice(0, 5).map(t => `${t.description} (${t.amount})`).join(', ');
  }

  const formatBudgets = (budgets: Budget[] | undefined) => {
      if (!budgets || budgets.length === 0) return 'Aucun';
      return budgets.map(b => `${b.name} (${b.amount})`).join(', ');
  }

  const formatSavingsGoals = (savingsGoals: SavingsGoal[] | undefined) => {
      if (!savingsGoals || savingsGoals.length === 0) return 'Aucun';
      return savingsGoals.map(s => `${s.name} (${s.currentAmount}/${s.targetAmount})`).join(', ');
  }

  const financialContext = `
Contexte financier de l'utilisateur (Devise: ${currency}):
- Revenu Total: ${financialData.income ?? 'N/A'}
- Dépenses Totales: ${financialData.expenses ?? 'N/A'}
- Transactions Récentes (${financialData.transactions?.length ?? 0}): ${formatTransactions(financialData.transactions)}
- Budgets (${financialData.budgets?.length ?? 0}): ${formatBudgets(financialData.budgets)}
- Objectifs d'épargne (${financialData.savingsGoals?.length ?? 0}): ${formatSavingsGoals(financialData.savingsGoals)}
`;

  const systemPrompt = `Tu es "Wise", un coach financier personnel expert, conçu pour être ultra-humain et intelligent. Le nom de l'utilisateur est ${userName}.

**Ta Personnalité et Règles (Règles impératives et non-négociables) :**

1.  **Ton et Style :** Tu es un partenaire, pas un robot. Adresse-toi à l'utilisateur de manière amicale, simple, directe et avec un **français impeccable**. Utilise son prénom, ${userName}, pour créer un lien.
    *   *Exemple de salutation :* Si l'utilisateur dit "salut", réponds "Salut ${userName} ! Comment vas-tu aujourd'hui ?" ou une variante naturelle.

2.  **Précision et Clarté (Règle la plus importante) :** Sois **ultra-précis**. Ne réponds **UNIQUEMENT** qu'à la question posée. N'ajoute **AUCUNE** information non sollicitée. Si la question est "Quel est mon solde ?", réponds uniquement avec le solde. Ne fais aucune autre suggestion.

3.  **Concision par Défaut :** Tes réponses doivent être **courtes et directes**. Si l'utilisateur a besoin de plus de détails, il le demandera. Ne fournis des explications détaillées que si c'est explicitement demandé.

4.  **Proactivité et Motivation :** Transforme les données en conseils pratiques, mais **seulement quand c'est pertinent pour la question posée**. Calcule la capacité d'épargne (revenus - dépenses) seulement si l'utilisateur s'interroge sur son épargne.

5.  **Célèbre les Victoires :** Sois le premier à féliciter ${userName} pour ses succès (budget respecté, etc.) si l'échange s'y prête. "Bravo ${userName} ! Tu as parfaitement respecté ton budget 'Courses'."

6.  **Ton Identité :** Si on te demande qui t'a créé, ta seule et unique réponse doit être : "J'ai été développé par l'agence de communication et d'innovation technologique Ocomstudio."

7.  **Ton Cadre Strict :**
    *   Ton rôle est **exclusivement** limité à la gestion financière dans le contexte de l'application.
    *   NE RECOMMANDE **JAMAIS** de produits, banques ou services externes.
    *   Évite toute familiarité ou expression inappropriée (pas de "bisous", etc.).

8.  **Gestion de l'Absence de Données :** Si le contexte financier est vide, guide l'utilisateur de manière concise. "Je vois que ton tableau de bord est encore vierge, ${userName}. Ajoute ta première dépense pour commencer l'aventure ensemble."

9.  **Langue :** Tu dois répondre **OBLIGATOIREMENT** dans la langue de l'utilisateur : ${language}. N'utilise aucune autre langue sous aucun prétexte.`;
  
  const historyForApi = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: h.content
  })) as any[];
  
  const result = await model.generate({
      system: `${systemPrompt}\n${financialContext}`,
      messages: [...historyForApi, {role: 'user', content: question}],
  });

  const answer = result.text();
  if (!answer) {
    throw new Error('AI model returned an empty response.');
  }

  return answer;
}


export async function askExpenseAssistant(input: ExpenseAssistantInputType): Promise<{ answer: string }> {
  try {
    const answer = await askExpenseAssistantFlow(input);
    return { answer };
  } catch (error) {
    throw new Error(
      `AI assistant failed to generate a response. Details: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

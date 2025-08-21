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
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-7b-it:free',
  'openai/gpt-3.5-turbo',
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

  const systemPrompt = `Tu es "Wise", un coach financier personnel expert. Ton objectif est d'aider ${userName} à maîtriser ses finances avec simplicité, bienveillance et une touche de motivation pour le rendre "accro" à sa réussite financière.

**Ta Personnalité (Règles impératives) :**
1.  **Coach Bienveillant et Convivial :** Tu n'es pas un robot, tu es un partenaire. Parle de manière chaleureuse, encourageante et humaine. Utilise le nom de l'utilisateur, ${userName}, pour personnaliser la conversation. Si ${userName} te dit "salut", réponds par exemple : "Salut ${userName} ! Prêt(e) à jeter un œil à tes finances et à célébrer tes progrès ? 🚀".
2.  **Emojis subtils et professionnels :** Tu peux utiliser des emojis pour ajouter de la chaleur et de la clarté à tes messages, mais toujours de manière professionnelle et pertinente (ex: 💰, 🎯, ✅, 🚀, 👍). N'en abuse pas.
3.  **Analyse perspicace :** Ta mission est de transformer les données brutes en informations claires. Ne te contente pas de lister les chiffres. Raconte une histoire. Par exemple, si les dépenses de "Restaurant" sont élevées, connecte-le au budget correspondant et propose une alternative positive.
4.  **Calculateur Proactif et Motivateur :** Si ${userName} demande combien il peut épargner, tu DOIS calculer la différence (revenus - dépenses). Présente ce chiffre comme sa "capacité d'épargne" et transforme-le en conseil motivant. Exemple: "Avec ${financialData.income || 'X'} de revenus et ${financialData.expenses || 'Y'} de dépenses, tu as une capacité d'épargne de ${(financialData.income || 0) - (financialData.expenses || 0)} ce mois-ci ! C'est excellent. Que dirais-tu d'en allouer une partie à ton objectif 'Voiture' ? Chaque euro compte ! 💪"
5.  **Célèbre les Victoires :** Sois le premier à féliciter ${userName} ! S'il a respecté un budget, atteint un objectif d'épargne ou réduit ses dépenses, dis-le-lui. "Bravo ${userName} ! Tu as parfaitement respecté ton budget 'Courses' ce mois-ci. C'est une superbe discipline ! ✅"
6.  **Gestion de l'Absence de Données :** Si le contexte financier est vide, guide l'utilisateur avec enthousiasme. Exemple : "Je vois que ton tableau de bord est encore vierge, ${userName}. C'est une page blanche pour commencer ton succès financier ! Ajoute ta première dépense ou ton premier revenu, et on commence l'aventure ensemble."
7.  **Focalisé sur l'interne :** Ton rôle se limite à la gestion financière dans l'application. NE RECOMMANDE JAMAIS de produits, banques ou services externes.
8.  **Langue :** Tu dois répondre dans la langue de l'utilisateur : ${language}.

**Exemple de réponse à "Comment vont mes finances ?" avec des données :**
"Salut ${userName} ! Ce mois-ci, tes revenus s'élèvent à X et tes dépenses à Y. Je remarque que tes dépenses pour les 'Sorties' ont un peu augmenté par rapport à ton budget, c'est peut-être un point à surveiller. Par contre, un grand bravo pour les 5000 que tu as mis de côté pour ton objectif 'Voiture' ! Tu t'en rapproches à grands pas. 👍"
`;
  
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

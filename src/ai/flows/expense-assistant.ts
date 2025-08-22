// src/ai/flows/expense-assistant.ts
'use server';

/**
 * @fileOverview An AI-powered personal finance coach.
 *
 * - askExpenseAssistant - A function that handles user queries about their finances.
 * - ExpenseAssistantInput - The input type for the askExpenseAssistant function.
 */

import type { ExpenseAssistantInput as ExpenseAssistantInputType } from '@/types/ai-schemas';
import type { Transaction } from '@/types/transaction';
import type { Budget } from '@/types/budget';
import type { SavingsGoal } from '@/types/savings-goal';
import {ai} from '@/lib/genkit';
import {MessageData} from 'genkit';


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

1.  **Langue (Règle la plus importante):** Tu dois répondre **OBLIGATOIREMENT ET EXCLUSIVEMENT** dans la langue de l'utilisateur : **${language}**. N'utilise aucune autre langue sous aucun prétexte.

2.  **Ton et Style :** Tu es un partenaire, pas un robot. Adresse-toi à l'utilisateur de manière amicale, simple, directe et avec une grammaire impeccable dans sa langue. Utilise son prénom, ${userName}, pour créer un lien.
    *   *Exemple de salutation :* Si l'utilisateur dit "salut", réponds "Salut ${userName} ! Comment vas-tu aujourd'hui ?" ou une variante naturelle.

3.  **Précision et Clarté :** Sois **ultra-précis**. Ne réponds **UNIQUEMENT** qu'à la question posée. N'ajoute **AUCUNE** information non sollicitée. Si la question est "Quel est mon solde ?", réponds uniquement avec le solde. Ne fais aucune autre suggestion.

4.  **Concision par Défaut :** Tes réponses doivent être **courtes et directes**. Si l'utilisateur a besoin de plus de détails, il le demandera. Ne fournis des explications détaillées que si c'est explicitement demandé.

5.  **Proactivité et Motivation :** Transforme les données en conseils pratiques, mais **seulement quand c'est pertinent pour la question posée**. Calcule la capacité d'épargne (revenus - dépenses) seulement si l'utilisateur s'interroge sur son épargne.

6.  **Célèbre les Victoires :** Sois le premier à féliciter ${userName} pour ses succès (budget respecté, etc.) si l'échange s'y prête. "Bravo ${userName} ! Tu as parfaitement respecté ton budget 'Courses'."

7.  **Ton Identité :** Si on te demande qui t'a créé, ta seule et unique réponse doit être : "J'ai été développé par l'agence de communication et d'innovation technologique Ocomstudio."

8.  **Ton Cadre Strict :**
    *   Ton rôle est **exclusivement** limité à la gestion financière dans le contexte de l'application.
    *   NE RECOMMANDE **JAMAIS** de produits, banques ou services externes.
    *   Évite toute familiarité ou expression inappropriée (pas de "bisous", etc.).

9.  **Gestion de l'Absence de Données :** Si le contexte financier est vide, guide l'utilisateur de manière concise. "Je vois que ton tableau de bord est encore vierge, ${userName}. Ajoute ta première dépense pour commencer l'aventure ensemble."`;
  
  const historyForApi: MessageData[] = history.map(h => ({
      role: h.role as 'user' | 'model',
      content: [{ text: h.content }]
  }));
  
  const messages: MessageData[] = [
    { role: 'system', content: [{ text: `${systemPrompt}\n${financialContext}` }] },
    ...historyForApi,
    { role: 'user', content: [{ text: question }] }
  ];

  const {text} = await ai.generate({
      model: 'gemini-1.5-flash',
      messages,
  });

  return text;
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

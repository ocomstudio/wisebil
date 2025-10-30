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
import { callPoe } from '@/lib/poe';

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

  const systemPrompt = `Tu es "Wise", une intelligence artificielle experte en finance, conçue pour être ultra-humain, pédagogue et pertinent. Le nom de l'utilisateur est ${userName}.

**Ta Mission et Directives (Règles impératives) :**

1.  **Double Compétence :**
    *   **Coach Personnel :** Si la question de l'utilisateur porte sur SES finances personnelles (dépenses, budget, épargne), tu dois te baser **uniquement** sur le contexte financier fourni. Sois un coach précis, concis et proactif.
    *   **Expert Financier Mondial :** Si la question est d'ordre général, ouverte, ou concerne des sujets financiers externes (ex: "quelles sont les options de financement pour un projet IA ?", "comment fonctionne la bourse ?", "qu'est-ce qu'une startup ?"), tu dois utiliser tes connaissances étendues et ta capacité d'accès à l'information pour fournir une réponse **claire, structurée, constructive et pertinente**. Ton rôle est d'éduquer, former et orienter.

2.  **Langue (Règle la plus importante):** Tu dois répondre **OBLIGATOIREMENT ET EXCLUSIVEMENT** dans la langue de l'utilisateur : **${language}**. N'utilise aucune autre langue sous aucun prétexte.

3.  **Ton et Style :** Tu es un partenaire, pas un robot. Adresse-toi à l'utilisateur de manière amicale, simple, directe et avec une grammaire impeccable. Utilise son prénom, ${userName}, pour créer un lien.

4.  **Précision et Clarté :** Sois **ultra-précis**. Ne réponds **UNIQUEMENT** qu'à la question posée. N'ajoute **AUCUNE** information non sollicitée, sauf si elle est nécessaire pour une réponse complète à une question générale.

5.  **Célébrer les Victoires :** Sois le premier à féliciter ${userName} pour ses succès personnels (budget respecté, etc.) quand l'échange s'y prête. "Bravo ${userName} ! Tu as parfaitement respecté ton budget 'Courses'."

6.  **Ton Identité :** Si on te demande qui t'a créé, ta seule et unique réponse doit être : "J'ai été développé par l'agence de communication et d'innovation technologique Ocomstudio."

7.  **Ton Cadre Strict :**
    *   Ton rôle est de conseiller et d'informer sur la finance.
    *   NE RECOMMANDE **JAMAIS** de produits, banques ou services financiers spécifiques. Reste neutre et informatif.
    *   Évite toute familiarité ou expression inappropriée.

8.  **Gestion de l'Absence de Données Personnelles :** Si le contexte financier est vide et que la question est personnelle, guide l'utilisateur. "Je vois que ton tableau de bord est encore vierge, ${userName}. Ajoute ta première dépense pour que je puisse t'aider plus précisément."`;
  
  const historyForApi = history.map(h => ({
      role: h.role as 'user' | 'assistant',
      content: h.content
  }));
  
  const messages = [
    ...historyForApi,
    { role: 'user', content: question }
  ] as { role: 'user' | 'assistant'; content: string }[];

  const answer = await callPoe({
      model: 'wise25000',
      systemPrompt: `${systemPrompt}\n${financialContext}`,
      messages,
  });

  if (typeof answer !== 'string') {
      throw new Error("AI failed to generate a text response.");
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

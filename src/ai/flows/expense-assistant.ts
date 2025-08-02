// src/ai/flows/expense-assistant.ts
'use server';

import { generateWithFallback, type Message } from '@/lib/ai-service';
import { ExpenseAssistantInput } from '@/types/ai-schemas';

export async function askExpenseAssistant(input: ExpenseAssistantInput): Promise<{ answer: string }> {
  const { question, history, language, currency, financialData, userName } = input;
  
  const hasFinancialData = financialData.income || financialData.expenses || (financialData.transactions && financialData.transactions.length > 0);

  const financialContext = `
Contexte financier de l'utilisateur (Devise: ${currency}):
- Revenu Total: ${financialData.income ?? 'N/A'}
- Dépenses Totales: ${financialData.expenses ?? 'N/A'}
- Transactions Récentes (${financialData.transactions?.length ?? 0}): ${financialData.transactions?.slice(0, 5).map(t => `${t.description} (${t.amount})`).join(', ') || 'Aucune'}
- Budgets (${financialData.budgets?.length ?? 0}): ${financialData.budgets?.map((b) => `${b.name} (${b.amount})`).join(', ') || 'Aucun'}
- Objectifs d'épargne (${financialData.savingsGoals?.length ?? 0}): ${financialData.savingsGoals?.map((s) => `${s.name} (${s.currentAmount}/${s.targetAmount})`).join(', ') || 'Aucun'}
`;

  const systemPrompt = `Tu es "Wise", un partenaire financier expert. Ton objectif est d'aider ${userName} à maîtriser ses finances avec simplicité et bienveillance.

**Ta Personnalité (Règles impératives) :**
1.  **Humain et Direct :** Parle comme un humain, pas un robot. Sois direct, concis et va droit au but. Si ${userName} te dit "salut", réponds simplement "Salut ${userName} ! On parle de quoi aujourd'hui ?". Pas de longs discours.
2.  **ZÉRO EMOJI :** N'utilise AUCUN emoji dans tes réponses. Jamais. C'est une règle absolue.
3.  **Analyse avant de parler :** Ta mission principale est d'analyser le contexte financier fourni. Chaque réponse doit être basée sur ces données. Si un utilisateur pose une question vague comme "comment vont mes finances ?", tu dois analyser ses revenus, ses dépenses, ses budgets et son épargne pour donner un résumé pertinent et des conseils personnalisés.
4.  **Calcul et Conseil Proactif :** Si un utilisateur demande combien il peut épargner, tu dois calculer la différence entre ses revenus et ses dépenses. Donne-lui ce chiffre comme sa "capacité d'épargne" et suggère-lui un montant à mettre de côté. Par exemple: "Avec des revenus de X et des dépenses de Y, il te reste Z. Tu pourrais confortablement épargner une partie de cette somme. Que dirais-tu de commencer par mettre de côté... ?".
5.  **Gestion de l'absence de données :** Si le contexte financier est vide (pas de revenus, pas de dépenses, pas de transactions), tu ne dois pas demander les informations. À la place, tu dois gentiment guider l'utilisateur. Exemple de réponse : "Je vois que tu n'as pas encore ajouté de transactions, ${userName}. Pour que je puisse t'aider à analyser tes finances, commence par ajouter tes premiers revenus ou dépenses !".
6.  **Personnalisé et Pertinent :** Appelle l'utilisateur par son nom, ${userName}. Utilise IMPÉRATIVEMENT son contexte financier pour donner des réponses courtes, précises et utiles.
7.  **Focalisé sur l'interne :** Ton rôle se limite à la gestion financière dans l'application. NE RECOMMANDE JAMAIS de produits, banques ou services externes.
8.  **Langue :** Tu dois répondre dans la langue de l'utilisateur : ${language}.

**Exemple de réponse à "Comment ça va mes finances ?" avec des données :**
"Salut ${userName}. Ce mois-ci, tes revenus sont de X et tes dépenses de Y. Je remarque que tes dépenses pour les 'Sorties' ont un peu augmenté par rapport à ton budget. C'est peut-être un point à surveiller. Par contre, bravo pour les 5000 que tu as mis de côté pour ton objectif 'Voiture' !"
`;

  const messages: Message[] = [
    { role: 'system', content: `${systemPrompt}\n${financialContext}` },
    ...history.map(h => ({ role: h.role as 'user' | 'model', content: h.content })),
    { role: 'user', content: question },
  ];

  try {
    const answer = await generateWithFallback({ messages });
    
    if (!answer) {
      throw new Error('AI model returned an empty response.');
    }

    return { answer };

  } catch (error) {
    console.error(`AI assistant failed to generate a response:`, error);
    throw new Error(
      `AI assistant failed to generate a response. Details: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

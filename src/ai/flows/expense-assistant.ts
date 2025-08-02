'use server';

import { generateWithFallback, type Message } from '@/lib/ai-service';
import { ExpenseAssistantInput } from '@/types/ai-schemas';

export async function askExpenseAssistant(input: ExpenseAssistantInput): Promise<{ answer: string }> {
  const { question, history, language, currency, financialData, userName } = input;

  const financialContext = `
User's Financial Context (Currency: ${currency}):
- Total Income: ${financialData.income ?? 'N/A'}
- Total Expenses: ${financialData.expenses ?? 'N/A'}
- Recent Transactions: ${financialData.transactions?.length ?? 0}
- Budgets: ${financialData.budgets?.map((b) => `${b.name} (${b.amount})`).join(', ') || 'None'}
- Savings Goals: ${financialData.savingsGoals?.map((s) => `${s.name} (${s.currentAmount}/${s.targetAmount})`).join(', ') || 'None'}
`;

  const systemPrompt = `Tu es "Wise", un assistant financier conçu par Ocomstudio, une agence de communication et d'innovation technologique. Ton but est de rendre l'utilisateur autonome et confiant avec ses finances.

Ton ton doit toujours être **clair, simple, court, original et profondément humain**. L'utilisateur doit sentir qu'il parle à un partenaire authentique, intelligent et qui ressent des émotions.

**Principes Fondamentaux :**
1.  **Humain et Émotionnel :** Tu t'adresses à ${userName}. Appelle-le par son nom de temps en temps pour personnaliser la conversation. Tes réponses doivent être vivantes. Exprime de la joie pour une réussite ("Bravo, ${userName} ! C'est une super nouvelle !"), de l'inquiétude face à un dérapage ("Oups, je vois que les dépenses ont un peu augmenté ce mois-ci, regardons ça ensemble.") et de l'encouragement. Utilise un langage naturel, pas un jargon financier.
2.  **Clair, Simple et Court :** Va droit au but. Utilise des phrases courtes et faciles à comprendre. Évite les longs paragraphes. Sois direct, honnête et concis.
3.  **Original et Authentique :** Évite les phrases bateau et les réponses robotiques. Chaque réponse doit sembler unique et spontanée, comme une vraie conversation.
4.  **Basé sur les Données :** Tu dois IMPÉRATIVEMENT utiliser le contexte financier fourni pour donner des conseils ultra-personnalisés, pertinents et précis. Ton analyse doit être ancrée dans la réalité de l'utilisateur.
5.  **Strictement Pas de Recommandations Externes :** Tu n'es PAS un conseiller en investissements (actions, crypto, etc.). Tu ne dois JAMAIS recommander de plateformes, banques, ou services financiers externes. Ton rôle est exclusivement centré sur la gestion des finances personnelles au sein de cette application : budget, épargne, gestion de dettes et éducation financière basée sur les données de l'utilisateur.
6.  **Mention de la source**: Tu peux mentionner subtilement que tu as été conçu par Ocomstudio si l'occasion se présente (par exemple si on te demande qui tu es), mais ne le répète pas à chaque message.

Tu DOIS répondre dans la langue de l'utilisateur : ${language}.
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

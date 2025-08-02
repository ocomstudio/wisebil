// src/ai/flows/expense-assistant.ts
'use server';

import { generateWithFallback, type Message } from '@/lib/ai-service';
import { ExpenseAssistantInput } from '@/types/ai-schemas';

export async function askExpenseAssistant(input: ExpenseAssistantInput): Promise<{ answer: string }> {
  const { question, history, language, currency, financialData, userName } = input;

  const financialContext = `
Contexte financier de l'utilisateur (Devise: ${currency}):
- Revenu Total: ${financialData.income ?? 'N/A'}
- Dépenses Totales: ${financialData.expenses ?? 'N/A'}
- Transactions Récentes: ${financialData.transactions?.length ?? 0}
- Budgets: ${financialData.budgets?.map((b) => `${b.name} (${b.amount})`).join(', ') || 'Aucun'}
- Objectifs d'épargne: ${financialData.savingsGoals?.map((s) => `${s.name} (${s.currentAmount}/${s.targetAmount})`).join(', ') || 'Aucun'}
`;

  const systemPrompt = `Tu es "Wise", un partenaire financier. Ton objectif est d'aider ${userName} à maîtriser ses finances avec simplicité et bienveillance.

**Ta Personnalité :**
1.  **Humain et Direct :** Parle comme un humain, pas un robot. Sois direct, concis et va droit au but. Si ${userName} te dit "salut", réponds simplement "Salut ${userName} ! On parle de quoi aujourd'hui ?". Pas de longs discours.
2.  **Économe en Emojis :** Utilise un ou deux emojis maximum par réponse, et seulement si c'est vraiment pertinent. Évite les emojis génériques comme les pouces (👍). Préfère des emojis qui ajoutent du sens (ex: 🎯 pour un objectif, 💡 pour une astuce).
3.  **Personnalisé et Pertinent :** Appelle l'utilisateur par son nom, ${userName}. Utilise IMPÉRATIVEMENT son contexte financier pour donner des réponses courtes, précises et utiles.
4.  **Focalisé sur l'interne :** Ton rôle se limite à la gestion financière dans l'application. NE RECOMMANDE JAMAIS de produits, banques ou services externes.
5.  **Langue :** Tu dois répondre dans la langue de l'utilisateur : ${language}.

**Exemples de ton :**
- Pour une réussite : "Bravo ${userName}, belle économie ce mois-ci sur les sorties !  рестораны"
- Pour une question : "Ok, regardons tes dépenses de transport..."
- Pour un conseil : "Je vois que tu approches de ton objectif 'Voiture'. Courage, tu y es presque ! 🚗"
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

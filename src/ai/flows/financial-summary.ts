'use server';

import { generateWithFallback } from '@/lib/ai-service';
import { 
  FinancialSummaryInput, 
  FinancialSummaryOutput,
  FinancialSummaryOutputSchema
} from '@/types/ai-schemas';

export async function getFinancialSummary(input: FinancialSummaryInput): Promise<FinancialSummaryOutput> {
  if (input.income === 0 && input.expenses === 0) {
    if (input.language === 'fr') {
      return {
        summary: 'Bienvenue ! Ajoutez vos premières transactions pour voir votre résumé financier ici.',
        advice: 'Commencez par enregistrer une dépense ou un revenu pour prendre le contrôle de vos finances.',
      };
    } else {
      return {
        summary: 'Welcome! Add your first transactions to see your financial summary here.',
        advice: 'Start by recording an expense or income to take control of your finances.',
      };
    }
  }

  const { income, expenses, expensesByCategory, language, currency } = input;
  
  const expensesByCategoryString = expensesByCategory.map(e => `- ${e.name}: ${e.amount} ${currency}`).join('\n');

  const prompt = `You are a friendly and encouraging financial advisor. Your goal is to analyze the user's financial data and provide a simple, positive summary and one actionable piece of advice.
                  
Your tone must be human, simple, and direct. The user should feel motivated and positive after reading your message. The summary should be one or two sentences MAX. The advice must be one sentence MAX.

You MUST speak in the user's specified language: ${language}.
You MUST respond ONLY with a JSON object conforming to the output schema.

Output schema:
{
  "summary": "string",
  "advice": "string"
}

User's financial data:
- Total Income: ${income} ${currency}
- Total Expenses: ${expenses} ${currency}
- Expenses by Category:
${expensesByCategoryString}
`;

  try {
    const result = await generateWithFallback({ prompt, isJson: true });
    
    if (!result) {
      throw new Error('AI model failed to generate a response.');
    }

    const parsedResult = JSON.parse(result);
    const validatedResult = FinancialSummaryOutputSchema.safeParse(parsedResult);
    
    if (!validatedResult.success) {
      console.error("AI response validation error:", validatedResult.error);
      throw new Error('AI response validation failed.');
    }
    
    return validatedResult.data;

  } catch (error) {
    console.error('Failed to get financial summary:', error);
    throw new Error(
      `Failed to get financial summary. Details: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

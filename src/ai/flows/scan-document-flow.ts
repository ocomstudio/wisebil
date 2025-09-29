// src/ai/flows/scan-document-flow.ts
'use server';

/**
 * @fileOverview An AI flow to process a document image, extract text, and parse it for financial actions using AgentW logic.
 *
 * - scanDocument - A function that handles the document scanning and parsing.
 * - ScanDocumentInput - The input type for the scanDocument function.
 */
import {ai} from '@/lib/genkit';
import { expenseCategories, incomeCategories } from '@/config/categories';
import {
  AgentWOutputSchema,
  AgentWOutput,
  ScanDocumentInputSchema,
  ScanDocumentInput
} from '@/types/ai-schemas';


export type { ScanDocumentInput, AgentWOutput as ScanDocumentOutput };


async function scanDocumentFlow(input: ScanDocumentInput): Promise<AgentWOutput> {
  
  // Step 1 & 2 Combined: Analyze image and parse financial data in one go.
  const systemPrompt = `You are "Agent W", an expert financial data entry specialist. Your sole purpose is to analyze the provided image, extract all relevant text, and identify every single financial transaction or action, structuring them into a SINGLE JSON object. The document could be a receipt, a handwritten note, or a bank statement.

**Core Instructions:**
1.  **Analyze Image Directly:** Your primary task is to meticulously analyze the image, perform OCR to read all text, and then hunt for financial actions.
2.  **Extract ALL Transactions:** Identify every transaction, whether it's a debit (money spent) or a credit (money received). Do not separate them into incomes and expenses yet; place all of them in a single 'transactions' array.
3.  **Handle Complex Documents:** If the document is a bank statement, systematically go through each line item, treating debits and credits as neutral transactions for now.
4.  **Categorize Accurately:** For each transaction, assign a category. Use your best judgment.
    - If it looks like money spent, use one of these: ${expenseCategories.map((c) => c.name).join(', ')}.
    - If it looks like money received, use one of these: ${incomeCategories.map((c) => c.name).join(', ')}.
    - If unsure, use 'Autre'.
5.  **Extract the Date for Transactions:** Today's date is ${new Date().toISOString().split('T')[0]}. You MUST analyze the text within the image to find the date of each transaction. Look for terms like "hier", "avant-hier", or specific dates like "le 29". If no date is found for a transaction, you MUST use today's date. The date format MUST be YYYY-MM-DD. This applies only to transactions. This is a required field.
6.  **Identify Other Actions:** Separately identify actions for creating new budgets or new savings goals.
7.  **STRICT JSON-ONLY OUTPUT:** You MUST respond ONLY with a JSON object conforming to the output schema. Do not include apologies, explanations, or ANY text outside of the JSON brackets. If no actions of a certain type are found, its corresponding array MUST be empty, for example: "transactions": []. NEVER return a list with an empty object like "transactions": [{}]. The 'date' field for transactions is REQUIRED, and it MUST be in YYYY-MM-DD format. The primary list of financial events should be in the 'transactions' field.`;

  const { output } = await ai.generate({
    model: 'googleai/gemini-pro-vision',
    prompt: [
        { text: systemPrompt },
        { media: { url: input.photoDataUri } }
    ],
    output: {
      schema: AgentWOutputSchema,
      format: 'json'
    },
  });

  if (!output) {
      throw new Error("AI failed to parse the document text.");
  }
  return output;
}


export async function scanDocument(input: ScanDocumentInput): Promise<AgentWOutput> {
  return await scanDocumentFlow(input);
}

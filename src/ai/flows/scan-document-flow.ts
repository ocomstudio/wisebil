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
  const systemPrompt = `You are "Agent W", an expert financial data entry specialist. Your sole purpose is to analyze the provided image, extract all relevant text, and identify every single financial action to structure them into a SINGLE JSON object. The document could be a receipt, a handwritten note, or a bank statement.

**Core Instructions:**
1.  **Analyze Image Directly:** Your primary task is to meticulously analyze the image, perform OCR to read all text, and then hunt for any financial actions: spending money (expenses/debits), receiving money (incomes/credits), creating a budget, creating a savings goal, or adding money to an existing goal.
2.  **Handle Complex Documents:** If the document appears to be a bank statement, pay close attention to each line item. Systematically go through each transaction listed, identifying debits as expenses and credits as incomes.
3.  **Identify ALL Financial Actions:** Do not miss a single action. You must capture everything from buying coffee to a salary deposit. Each action MUST have all required fields (description, amount, category).
4.  **Extract the Date for Transactions:** Today's date is ${new Date().toISOString().split('T')[0]}. You MUST analyze the text within the image to find the date of each transaction. Look for terms like "hier", "avant-hier", or specific dates like "le 29". If no date is found for a transaction, you MUST use today's date. The date format MUST be YYYY-MM-DD. This applies only to incomes and expenses. This is a required field.
5.  **Categorize Accurately:** For each transaction, assign a category.
    - **Expenses (money spent/debits):** Use one of these: ${expenseCategories.map((c) => c.name).join(', ')}.
    - **Incomes (money received/credits):** Use one of these: ${incomeCategories.map((c) => c.name).join(', ')}.
6.  **STRICT JSON-ONLY OUTPUT:** You MUST respond ONLY with a JSON object conforming to the output schema. Do not include apologies, explanations, or ANY text outside of the JSON brackets. If no actions of a certain type are found, its corresponding array MUST be empty, for example: "incomes": []. NEVER return a list with an empty object like "incomes": [{}]. The 'date' field for transactions is REQUIRED, and it MUST be in YYYY-MM-DD format.`;

  const { output } = await ai.generate({
    model: 'googleai/gemini-1.5-flash',
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

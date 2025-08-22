// src/ai/flows/process-receipt-flow.ts
'use server';

/**
 * @fileOverview An AI flow to process and extract information from a receipt image.
 *
 * - processReceipt - A function that handles the receipt processing.
 * - ProcessReceiptInput - The input type for the processReceipt function.
 * - ProcessReceiptOutput - The return type for the processReceipt function.
 */
import {ai} from '@/lib/genkit';
import { expenseCategories } from '@/config/categories';
import {
  ProcessReceiptInputSchema,
  ProcessReceiptOutputSchema,
  type ProcessReceiptInput,
  type ProcessReceiptOutput,
} from '@/types/ai-schemas';
import { Part } from 'genkit';


export type { ProcessReceiptInput, ProcessReceiptOutput };


async function processReceiptFlow(input: ProcessReceiptInput): Promise<ProcessReceiptOutput> {
  const systemPrompt = `You are an expert at processing receipts. Analyze the image and extract the following information: merchant name, total amount, and transaction date. Also, suggest an appropriate expense category from this list: ${expenseCategories.map(c => c.name).join(', ')}. If no date is found, use today's date: ${new Date().toISOString().split('T')[0]}.
  The date format MUST be YYYY-MM-DD.`;

  const prompt = [
      { text: systemPrompt },
      { media: { url: input.photoDataUri } }
  ];

  const { output } = await ai.generate({
    model: 'googleai/gemini-1.5-flash',
    prompt,
    output: {
      schema: ProcessReceiptOutputSchema,
      format: 'json',
    },
  });
  
  if (!output) {
    throw new Error("AI failed to generate a response from the receipt image.");
  }
  return output;
}

export async function processReceipt(input: ProcessReceiptInput): Promise<ProcessReceiptOutput> {
  return await processReceiptFlow(input);
}

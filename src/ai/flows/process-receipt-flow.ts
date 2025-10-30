// src/ai/flows/process-receipt-flow.ts
'use server';

/**
 * @fileOverview An AI flow to process and extract information from a receipt image.
 *
 * - processReceipt - A function that handles the receipt processing.
 * - ProcessReceiptInput - The input type for the processReceipt function.
 * - ProcessReceiptOutput - The return type for the processReceipt function.
 */
import { callPoe } from '@/lib/poe';
import { expenseCategories } from '@/config/categories';
import {
  ProcessReceiptInputSchema,
  ProcessReceiptOutputSchema,
  type ProcessReceiptInput,
  type ProcessReceiptOutput,
} from '@/types/ai-schemas';


export type { ProcessReceiptInput, ProcessReceiptOutput };


async function processReceiptFlow(input: ProcessReceiptInput): Promise<ProcessReceiptOutput> {
  const systemPrompt = `You are an expert at processing receipts. Analyze the image and extract the following information: merchant name, total amount, and transaction date. Also, suggest an appropriate expense category from this list: ${expenseCategories.map(c => c.name).join(', ')}. If no date is found, use today's date: ${new Date().toISOString().split('T')[0]}.
  The date format MUST be YYYY-MM-DD.`;

  const mimeType = input.photoDataUri.substring(input.photoDataUri.indexOf(':') + 1, input.photoDataUri.indexOf(';'));

  const result = await callPoe({
    model: 'Claude-3-Sonnet',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: systemPrompt },
          { 
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: input.photoDataUri.split(',')[1],
            }
          }
        ]
      }
    ],
    jsonResponseSchema: ProcessReceiptOutputSchema,
  });

  if (typeof result === 'string' || !result) {
    throw new Error("AI failed to generate a response from the receipt image.");
  }
  return result as ProcessReceiptOutput;
}

export async function processReceipt(input: ProcessReceiptInput): Promise<ProcessReceiptOutput> {
  return await processReceiptFlow(input);
}

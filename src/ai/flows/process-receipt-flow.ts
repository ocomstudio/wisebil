// src/ai/flows/process-receipt-flow.ts
'use server';

/**
 * @fileOverview An AI flow to process and extract information from a receipt image.
 *
 * - processReceipt - A function that handles the receipt processing.
 * - ProcessReceiptInput - The input type for the processReceipt function.
 * - ProcessReceiptOutput - The return type for the processReceipt function.
 */

import { expenseCategories } from '@/config/categories';
import {
  ProcessReceiptInputSchema,
  ProcessReceiptOutputSchema,
  type ProcessReceiptInput,
  type ProcessReceiptOutput,
} from '@/types/ai-schemas';
import { generate } from '@/services/ai-service';

export type { ProcessReceiptInput, ProcessReceiptOutput };


async function processReceiptFlow(input: ProcessReceiptInput): Promise<ProcessReceiptOutput> {
  const systemPrompt = `You are an expert at processing receipts. Analyze the image and extract the following information: merchant name, total amount, and transaction date. Also, suggest an appropriate expense category from this list: ${expenseCategories.map(c => c.name).join(', ')}. If no date is found, use today's date: ${new Date().toISOString().split('T')[0]}.
  You MUST respond ONLY with a JSON object conforming to the output schema.
  The date format MUST be YYYY-MM-DD.`;

  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: [
          { type: 'text', text: 'Extract the details from this receipt.' },
          {
              type: 'image_url',
              image_url: {
                  url: input.photoDataUri,
              },
          },
      ],
  }];

  const rawOutput = await generate({
    messages,
    output: {
      format: 'json',
      schema: ProcessReceiptOutputSchema,
    },
    modelType: 'vision',
  });
  
  const output = ProcessReceiptOutputSchema.parse(rawOutput);
  if (!output) {
    throw new Error("AI failed to generate a response from the receipt image.");
  }
  return output;
}

export async function processReceipt(input: ProcessReceiptInput): Promise<ProcessReceiptOutput> {
  return await processReceiptFlow(input);
}

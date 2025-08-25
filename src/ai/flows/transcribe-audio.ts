// src/ai/flows/transcribe-audio.ts
'use server';
/**
 * @fileOverview An AI flow to transcribe audio to text.
 *
 * - transcribeAudio - A function that handles audio transcription.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */
import {ai} from '@/lib/genkit';
import type { TranscribeAudioInput, TranscribeAudioOutput } from '@/types/ai-schemas';

export type { TranscribeAudioInput, TranscribeAudioOutput };

async function transcribeAudioFlow(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
    const systemPrompt = "You are an expert audio transcription service. Transcribe the user's speech from the provided audio file accurately. The user is likely speaking French (fr-FR). Respond ONLY with the transcribed text.";

    // The audio data URI already contains the mime type, so we can use it directly.
    const [mediaType, base64Data] = input.audioDataUri.split(',');
    
    const audioPart = {
      media: {
        url: input.audioDataUri,
        // The mime type is extracted from the data URI, e.g., "data:audio/webm;codecs=opus"
        contentType: mediaType.replace('data:', '').replace(';base64', ''),
      },
    };

    const { text: transcript } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: [
            { text: systemPrompt },
            audioPart
        ],
    });

    if (typeof transcript !== 'string') {
        throw new Error("AI failed to return a valid transcript.");
    }
    
    return { transcript };
}

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return await transcribeAudioFlow(input);
}

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
import wav from 'wav';
import { Buffer } from 'buffer';
import type { TranscribeAudioInput, TranscribeAudioOutput } from '@/types/ai-schemas';

export type { TranscribeAudioInput, TranscribeAudioOutput };


async function transcribeAudioFlow(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
    const systemPrompt = "You are an expert audio transcription service. Transcribe the user's speech from the provided audio file accurately. The user is likely speaking French (fr-FR). Respond ONLY with the transcribed text.";

    const prompt = [
        { text: systemPrompt },
        { media: { url: input.audioDataUri } }
    ];

    const {text: transcript} = await ai.generate({
        model: 'gemini-1.5-flash',
        prompt,
    });

    if (typeof transcript !== 'string') {
        throw new Error("AI failed to return a valid transcript.");
    }
    
    return { transcript };
}

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return await transcribeAudioFlow(input);
}

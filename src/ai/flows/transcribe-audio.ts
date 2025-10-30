// src/ai/flows/transcribe-audio.ts
'use server';
/**
 * @fileOverview An AI flow to transcribe audio to text.
 *
 * - transcribeAudio - A function that handles audio transcription.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */
import { callPoe } from '@/lib/poe';
import type { TranscribeAudioInput, TranscribeAudioOutput } from '@/types/ai-schemas';

export type { TranscribeAudioInput, TranscribeAudioOutput };

async function transcribeAudioFlow(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
    const systemPrompt = "You are an expert audio transcription service. Transcribe the user's speech from the provided audio file accurately. The user is likely speaking French (fr-FR). Respond ONLY with the transcribed text.";

    // The audio data URI already contains the mime type, so we can use it directly.
    const [mediaType, base64Data] = input.audioDataUri.split(',');
    
    // Poe API does not currently support direct audio file uploads via the chat completions API.
    // This is a placeholder for how it *would* work if supported.
    // In a real scenario, you might need to use a different service or API endpoint for transcription.
    // For now, we will simulate this by sending a text-based request.
    
    // As a workaround, we will inform the model we have audio and ask it to respond with the transcript.
    // This will likely not work as expected without a proper audio transcription model.
    const result = await callPoe({
      model: 'Claude-3-Sonnet',
      systemPrompt,
      messages: [{ role: 'user', content: 'The user has provided an audio file to transcribe. Please transcribe it. [Simulated Audio Data]' }],
    });
    
    if (typeof result !== 'string') {
        throw new Error("AI failed to return a valid transcript.");
    }
    
    // Since we can't actually transcribe, we'll return a placeholder.
    // In a real implementation with a proper audio API, you'd return the actual transcript.
    // return { transcript: result };

    // For now, let's just return the placeholder text as the transcript for demonstration.
    return { transcript: "Transcription de l'audio non prise en charge pour le moment." };
}

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return await transcribeAudioFlow(input);
}

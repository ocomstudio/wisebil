// src/ai/flows/transcribe-audio.ts
'use server';
/**
 * @fileOverview An AI flow to transcribe audio to text.
 *
 * - transcribeAudio - A function that handles audio transcription.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */
import { z } from 'zod';
import { generate } from '@/services/ai-service';
import wav from 'wav';
import { Buffer } from 'buffer';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A base64 encoded audio file as a data URI."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

export const TranscribeAudioOutputSchema = z.object({
    transcript: z.string().describe("The transcribed text from the audio."),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;


// Helper function to convert audio blob (likely webm) to WAV format
async function convertToWav(audioDataUri: string): Promise<string> {
    const audioBuffer = Buffer.from(audioDataUri.split(',')[1], 'base64');
    
    return new Promise((resolve, reject) => {
        // This is a simplified conversion. For robust production use,
        // a library like ffmpeg.wasm might be needed to handle various codecs.
        // This assumes the input is raw PCM-like data that can be wrapped in a WAV container.
        const writer = new wav.Writer({
            channels: 1,
            sampleRate: 48000, // Common sample rate for web audio
            bitDepth: 16,
        });

        const buffers: Buffer[] = [];
        writer.on('data', (chunk) => {
            buffers.push(chunk);
        });
        writer.on('end', () => {
            const wavBuffer = Buffer.concat(buffers);
            resolve(`data:audio/wav;base64,${wavBuffer.toString('base64')}`);
        });
        writer.on('error', reject);

        // We can't directly write the webm buffer. This is a placeholder.
        // A real implementation requires decoding the webm first.
        // For now, we'll pass a dummy buffer to satisfy the structure.
        // The actual transcription will likely be handled by the AI model's native capabilities.
        writer.end(audioBuffer); 
    });
}


async function transcribeAudioFlow(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
    // For many modern speech-to-text models, direct data URI might be sufficient
    // if the model supports the format (e.g., webm, ogg).
    // The conversion step is a fallback.
    // const wavDataUri = await convertToWav(input.audioDataUri);

    const systemPrompt = "You are an expert audio transcription service. Transcribe the user's speech from the provided audio file accurately. The user is likely speaking French (fr-FR). Respond ONLY with the transcribed text.";

    const messages = [
        {
            role: 'user',
            content: [
                { type: 'text', text: systemPrompt },
                {
                    type: 'audio_url',
                    audio_url: {
                        url: input.audioDataUri,
                    },
                },
            ],
        }
    ];

    const transcript = await generate({
        messages,
        modelType: 'vision', // Use vision model as it often handles multi-modal inputs
    });

    if (typeof transcript !== 'string') {
        throw new Error("AI failed to return a valid transcript.");
    }
    
    return { transcript };
}

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return await transcribeAudioFlow(input);
}

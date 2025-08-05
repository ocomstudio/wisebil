// src/lib/openai.ts
import OpenAI from 'openai';

// The API key is now set during initialization.
// IMPORTANT: This key is read from environment variables. 
// Ensure NEXT_PUBLIC_OPENROUTER_API_KEY is set in your .env file.
export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
  defaultHeaders: {
    "HTTP-Referer": "https://wisebil.com", 
    "X-Title": "Wisebil",
    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
  },
});

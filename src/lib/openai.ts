import OpenAI from 'openai';

// The API key is now set during initialization.
export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://wisebil.com", 
    "X-Title": "Wisebil",
  },
});

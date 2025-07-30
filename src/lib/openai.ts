import OpenAI from 'openai';
import 'dotenv/config';

// The API key will be passed on each request, not during initialization.
export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://wisebil.com", 
    "X-Title": "Wisebil",
  },
});

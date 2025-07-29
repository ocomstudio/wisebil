// src/services/openrouter.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": "https://wisebil.app", 
    "X-Title": "Wisebil", 
  },
});

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function getOpenRouterCompletion(messages: ChatMessage[]): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "qwen/qwen2-72b-instruct",
    messages: messages,
  });

  return completion.choices[0].message?.content || "";
}

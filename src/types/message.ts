// src/types/message.ts
export interface Message {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string | any;
}

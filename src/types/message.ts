// src/types/message.ts
export interface Message {
  role: 'user' | 'model';
  content: { text: string }[];
}

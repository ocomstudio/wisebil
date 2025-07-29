// src/components/dashboard/assistant-panel.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { askExpenseAssistant } from '@/ai/flows/expense-assistant';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/locale-context';

type AssistantFormValues = z.infer<ReturnType<typeof assistantSchema>>;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const { toast } = useToast();
  const { t } = useLocale();

  const assistantSchema = (t: (key: string) => string) => z.object({
    prompt: z.string().min(1, t('prompt_min_error')),
  });

  const form = useForm<AssistantFormValues>({
    resolver: zodResolver(assistantSchema(t)),
    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = async (data: AssistantFormValues) => {
    const userMessage: Message = { role: 'user', content: data.prompt };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();
    setIsThinking(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : ('model' as 'user' | 'model'),
        content: [{ text: m.content }],
      }));

      const result = await askExpenseAssistant({
        question: data.prompt,
        history,
        language: 'en', // This should be dynamic based on locale
      });
      const assistantMessage: Message = { role: 'assistant', content: result.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI assistant failed:', error);
      toast({
        variant: 'destructive',
        title: t('assistant_error_title'),
        description: t('assistant_error_desc'),
      });
       // Remove the user message if the assistant fails
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background md:bg-transparent">
       <div className='p-4 md:p-6 border-b'>
         <h1 className="text-xl font-bold font-headline">{t('ai_assistant_title')}</h1>
       </div>
       <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
          <ScrollArea className="flex-1 pr-4 -mr-4 mb-4">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isThinking && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 max-w-sm bg-muted flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-center gap-2 pt-4 border-t"
            >
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder={t('ask_a_question_placeholder')}
                        {...field}
                        disabled={isThinking}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isThinking}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </Form>
        </div>
    </div>
  );
}

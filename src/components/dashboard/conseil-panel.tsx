// src/components/dashboard/conseil-panel.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { askExpenseAssistant } from '@/ai/flows/expense-assistant';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from '../ui/separator';

const assistantSchema = z.object({
  prompt: z.string().min(1, 'Please enter a question.'),
});

type AssistantFormValues = z.infer<typeof assistantSchema>;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type Conversation = Message[];

export function ConseilPanel() {
  const [currentConversation, setCurrentConversation] = useState<Conversation>([]);
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const { toast } = useToast();

  const form = useForm<AssistantFormValues>({
    resolver: zodResolver(assistantSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const handleNewConversation = () => {
    if (currentConversation.length > 0) {
      setConversationHistory(prev => [currentConversation, ...prev]);
    }
    setCurrentConversation([]);
  };

  const onSubmit = async (data: AssistantFormValues) => {
    const userMessage: Message = { role: 'user', content: data.prompt };
    const newConversation = [...currentConversation, userMessage];
    setCurrentConversation(newConversation);
    form.reset();
    setIsThinking(true);

    try {
      const history = newConversation.map(m => `${m.role}: ${m.content}`).join('\n');
      const result = await askExpenseAssistant({ question: data.prompt, history });
      const assistantMessage: Message = { role: 'assistant', content: result.answer };
      setCurrentConversation(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI assistant failed:', error);
      toast({
        variant: 'destructive',
        title: 'Assistant Error',
        description: 'The assistant could not respond. Please try again.',
      });
       // remove the user message if the assistant fails
      setCurrentConversation(prev => prev.slice(0, -1));
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background md:bg-transparent">
       <div className='p-4 md:p-6 border-b flex justify-between items-center'>
         <h1 className="text-xl font-bold font-headline">Conseil IA</h1>
         <Button variant="ghost" size="sm" onClick={handleNewConversation}>
           <PlusCircle className="mr-2 h-4 w-4" />
           Nouveau
         </Button>
       </div>
       <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
          <ScrollArea className="flex-1 pr-4 -mr-4 mb-4">
            <div className="space-y-6">
              {currentConversation.map((message, index) => (
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

          <div className='space-y-4'>
            {conversationHistory.length > 0 && (
              <>
                 <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Historique</AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="h-32">
                        <div className='space-y-2'>
                          {conversationHistory.map((convo, index) => (
                              <div key={index} className="p-2 bg-muted/50 rounded-md text-sm truncate cursor-pointer hover:bg-muted" onClick={() => {
                                setConversationHistory(prev => prev.filter((_, i) => i !== index));
                                if (currentConversation.length > 0) {
                                  setConversationHistory(prev => [currentConversation, ...prev]);
                                }
                                setCurrentConversation(convo);
                              }}>
                                {convo[0]?.content || 'Conversation vide'}
                              </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}

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
                          placeholder="Posez une question..."
                          {...field}
                          disabled={isThinking}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="icon" disabled={isThinking || !form.formState.isValid}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </Form>
          </div>
        </div>
    </div>
  );
}

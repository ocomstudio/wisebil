// src/components/dashboard/conseil-panel.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { askExpenseAssistant } from '@/ai/flows/expense-assistant';
import { runWiseAgent } from '@/ai/flows/wise-agent';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, PlusCircle, Mic, MicOff, BrainCircuit, Bot } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocale } from '@/context/locale-context';
import { useTransactions } from '@/context/transactions-context';
import { useBudgets } from '@/context/budget-context';
import { useSavings } from '@/context/savings-context';
import type { Transaction } from '@/types/transaction';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';


const assistantSchema = z.object({
  prompt: z.string().min(1, 'Veuillez entrer une question.'),
});

type AssistantFormValues = z.infer<typeof assistantSchema>;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type Conversation = Message[];

const CONVERSATION_HISTORY_KEY = 'wisebil-conversation-history';

export function ConseilPanel() {
  const { t, locale, currency } = useLocale();
  const { transactions, income, expenses, addTransaction } = useTransactions();
  const { budgets } = useBudgets();
  const { savingsGoals } = useSavings();

  const [currentConversation, setCurrentConversation] = useState<Conversation>([]);
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast: uiToast } = useToast();

  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);

  // Load conversation from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(CONVERSATION_HISTORY_KEY);
      if (storedHistory) {
        setConversationHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load conversation history from localStorage", error);
    }
  }, []);

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    try {
        const historyToSave = [currentConversation, ...conversationHistory].filter(c => c.length > 0);
        localStorage.setItem(CONVERSATION_HISTORY_KEY, JSON.stringify(historyToSave));
    } catch (error) {
        console.error("Failed to save conversation history to localStorage", error);
    }
  }, [currentConversation, conversationHistory]);

  const form = useForm<AssistantFormValues>({
    resolver: zodResolver(assistantSchema),
    defaultValues: {
      prompt: '',
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollEl = scrollAreaRef.current.querySelector('div');
      if (scrollEl) {
        scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [currentConversation, isThinking]);

  const handleToggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
       const currentPrompt = form.getValues('prompt');
       if (currentPrompt) {
           form.setValue('prompt', currentPrompt + ' ');
       }
       recognitionRef.current.start();
    }
    setIsListening(!isListening);
  }, [isListening, form]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const supported = !!SpeechRecognition;
    setIsSpeechRecognitionSupported(supported);

    if (!supported) return;

    if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = locale;

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
                } else {
                interimTranscript += event.results[i][0].transcript;
                }
            }
            form.setValue('prompt', form.getValues('prompt') + finalTranscript + interimTranscript, { shouldValidate: true });
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            uiToast({ variant: 'destructive', title: t('speech_recognition_error') });
            setIsListening(false);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        }
    } else {
      recognitionRef.current.lang = locale;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [form, uiToast, locale, t]);


  const handleNewConversation = () => {
    if (currentConversation.length > 0) {
      setConversationHistory(prev => [currentConversation, ...prev]);
    }
    setCurrentConversation([]);
  };

  const processWiseAgent = async (prompt: string) => {
    setIsThinking(true);
    const agentPrompt = prompt.replace(/^wa\s*/i, '');
    const userMessage: Message = { role: 'user', content: prompt };
    setCurrentConversation(prev => [...prev, userMessage]);
    
    try {
      const result = await runWiseAgent({ prompt: agentPrompt, currency });
      const { incomes, expenses: extractedExpenses } = result;

      const incomeCount = incomes.length;
      const expenseCount = extractedExpenses.length;

      // Add incomes to context
      for (const income of incomes) {
        const newTransaction: Transaction = {
          id: uuidv4(),
          type: 'income',
          ...income,
          date: new Date().toISOString(),
        };
        await addTransaction(newTransaction);
      }

      // Add expenses to context
      for (const expense of extractedExpenses) {
        const newTransaction: Transaction = {
          id: uuidv4(),
          type: 'expense',
          ...expense,
          date: new Date().toISOString(),
        };
        await addTransaction(newTransaction);
      }
      
      const summaryMessage = `J'ai terminé ! J'ai ajouté ${incomeCount} revenu(s) et ${expenseCount} dépense(s) à votre registre.`;
      const assistantMessage: Message = { role: 'assistant', content: summaryMessage };
      setCurrentConversation(prev => [...prev, assistantMessage]);
      toast.success(summaryMessage);

    } catch (error) {
      console.error('Wise Agent failed:', error);
      const errorMessage = "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.";
      const assistantMessage: Message = { role: 'assistant', content: errorMessage };
      setCurrentConversation(prev => [...prev, assistantMessage]);
      toast.error(errorMessage);
    } finally {
      setIsThinking(false);
    }
  };


  const processWiseAssistant = async (prompt: string) => {
    const userMessage: Message = { role: 'user', content: prompt };
    const newConversationWithUserMessage = [...currentConversation, userMessage];
    setCurrentConversation(newConversationWithUserMessage);
    setIsThinking(true);
  
    try {
      const result = await askExpenseAssistant({
        question: prompt,
        history: currentConversation,
        language: locale,
        currency,
        financialData: {
          income,
          expenses,
          transactions,
          budgets,
          savingsGoals
        }
      });

      const assistantMessage: Message = { role: 'assistant', content: result.answer };
      setCurrentConversation(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('AI assistant failed:', error);
      uiToast({
        variant: 'destructive',
        title: t('assistant_error_title'),
        description: t('assistant_error_desc'),
      });
      setCurrentConversation(prev => prev.slice(0, -1));
    } finally {
      setIsThinking(false);
    }
  };

  const onSubmit = async (data: AssistantFormValues) => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    
    const prompt = data.prompt.trim();
    form.reset();

    if (prompt.toLowerCase().startsWith('wa ')) {
      await processWiseAgent(prompt);
    } else {
      await processWiseAssistant(prompt);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background md:bg-transparent">
      <header className='p-4 md:p-6 border-b flex justify-between items-center flex-shrink-0'>
        <h1 className="text-xl font-bold font-headline">{t('nav_advice')} IA</h1>
        <Button variant="ghost" size="sm" onClick={handleNewConversation}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('new_chat_button')}
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-6 space-y-6 pb-8">
            {currentConversation.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                     <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                  <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 max-w-sm bg-muted flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 animate-pulse" />
                  <span className="text-sm text-muted-foreground italic">Réflexion en cours...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <footer className='p-4 md:p-6 border-t space-y-4 flex-shrink-0 bg-background'>
        {conversationHistory.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>{t('history_button')}</AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-32">
                  <div className='space-y-2 pr-4'>
                    {conversationHistory.map((convo, index) => (
                        <div key={index} className="p-2 bg-muted/50 rounded-md text-sm truncate cursor-pointer hover:bg-muted" onClick={() => {
                          setConversationHistory(prev => prev.filter((_, i) => i !== index));
                          if (currentConversation.length > 0) {
                            setConversationHistory(prev => [currentConversation, ...prev]);
                          }
                          setCurrentConversation(convo);
                        }}>
                          {convo[0]?.content || t('empty_conversation')}
                        </div>
                    ))}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-center gap-2"
          >
             {isSpeechRecognitionSupported && (
              <Button type="button" size="icon" variant={isListening ? "destructive" : "outline"} onClick={handleToggleListening} disabled={isThinking}>
                 {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            )}
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
                      className="pr-10"
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
      </footer>
    </div>
  );
}

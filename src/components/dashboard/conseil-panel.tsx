'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, PlusCircle, Mic, MicOff, BrainCircuit, Bot, MessageSquare, ScanLine, Trash2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLocale } from '@/context/locale-context';
import { useAuth } from '@/context/auth-context';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { askExpenseAssistant } from '@/ai/flows/expense-assistant';
import { runAgentW } from '@/ai/flows/wise-agent';
import { useTransactions } from '@/context/transactions-context';
import { useBudgets } from '@/context/budget-context';
import { useSavings } from '@/context/savings-context';
import { v4 as uuidv4 } from "uuid";
import type { ExpenseAssistantInput, AgentWInput, AgentWOutput } from '@/types/ai-schemas';


const assistantSchema = z.object({
  prompt: z.string().min(1, 'Veuillez entrer une question.'),
});

type AssistantFormValues = z.infer<typeof assistantSchema>;

interface Message {
  role: 'user' | 'model';
  content: string;
  agentMode?: AgentMode;
  isError?: boolean;
}

type Conversation = Message[];
type AgentMode = 'wise' | 'agent';

const CONVERSATION_HISTORY_KEY = 'wisebil-conversation-history';

export function ConseilPanel() {
  const { t, locale, currency, formatCurrency } = useLocale();
  const { user } = useAuth();
  const { transactions, income, expenses, addTransaction } = useTransactions();
  const { budgets, addBudget } = useBudgets();
  const { savingsGoals, addSavingsGoal, addFunds } = useSavings();

  const [isClient, setIsClient] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation>([]);
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [agentMode, setAgentMode] = useState<AgentMode>('wise');
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast: uiToast } = useToast();

  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load conversation from localStorage on initial render
  useEffect(() => {
    if (!isClient) return;
    try {
      const storedHistory = localStorage.getItem(CONVERSATION_HISTORY_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        if(Array.isArray(parsedHistory) && parsedHistory.length > 0) {
            setCurrentConversation(parsedHistory[0] || []);
            setConversationHistory(parsedHistory.slice(1));
        }
      } else {
        // Add a welcome message if no history
        setCurrentConversation([{
            role: 'model',
            content: t('assistant_welcome_message').replace('{{name}}', user?.fullName.split(' ')[0] || ''),
            agentMode: 'wise'
        }]);
      }
    } catch (error) {
      console.error("Failed to load conversation history from localStorage", error);
    }
  }, [isClient, t, user]);

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (!isClient) return;
    try {
        const historyToSave = [currentConversation, ...conversationHistory].filter(c => c.length > 0);
        localStorage.setItem(CONVERSATION_HISTORY_KEY, JSON.stringify(historyToSave));
    } catch (error) {
        console.error("Failed to save conversation history to localStorage", error);
    }
  }, [currentConversation, conversationHistory, isClient]);

  const form = useForm<AssistantFormValues>({
    resolver: zodResolver(assistantSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const promptValue = form.watch('prompt');

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [promptValue]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollEl = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
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
    if (!isClient) return;
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
  }, [isClient, form, uiToast, locale, t]);


  const handleNewConversation = () => {
    if (currentConversation.length > 0 && !currentConversation.every(m => m.isError)) {
      setConversationHistory(prev => [currentConversation, ...prev].filter(c => c.length > 0));
    }
    setCurrentConversation([{
        role: 'model',
        content: t('assistant_welcome_message').replace('{{name}}', user?.fullName.split(' ')[0] || ''),
        agentMode: 'wise'
    }]);
  };

  const deleteConversationFromHistory = (indexToDelete: number) => {
    setConversationHistory(prev => prev.filter((_, i) => i !== indexToDelete));
    toast.success(t('history_deleted_success'));
  };

  const processAgentWResponse = (response: AgentWOutput) => {
    let summary = t('agent_w_summary_title') + '\n';
    let itemsAdded = 0;

    if (response.incomes?.length) {
        response.incomes.forEach((i: any) => {
            addTransaction({ ...i, type: 'income', id: uuidv4() });
            summary += `- ${t('income')}: ${i.description} (${formatCurrency(i.amount)})\n`;
            itemsAdded++;
        });
    }
    if (response.expenses?.length) {
        response.expenses.forEach((e: any) => {
            addTransaction({ ...e, type: 'expense', id: uuidv4() });
            summary += `- ${t('expense')}: ${e.description} (${formatCurrency(e.amount)})\n`;
            itemsAdded++;
        });
    }
    if (response.newBudgets?.length) {
        response.newBudgets.forEach((b: any) => {
            addBudget({ ...b, id: uuidv4() });
            summary += `- ${t('budget')}: ${b.name} (${formatCurrency(b.amount)})\n`;
            itemsAdded++;
        });
    }
    if (response.newSavingsGoals?.length) {
        response.newSavingsGoals.forEach((g: any) => {
            addSavingsGoal({ ...g, id: uuidv4() });
            summary += `- ${t('goal')}: ${g.name} (${formatCurrency(g.targetAmount)})\n`;
            itemsAdded++;
        });
    }
    if (response.savingsContributions?.length) {
        response.savingsContributions.forEach((c: any) => {
            addFunds(c.goalName, c.amount);
            summary += `- ${t('contribution')}: ${c.goalName} (+${formatCurrency(c.amount)})\n`;
            itemsAdded++;
        });
    }

    if (itemsAdded === 0) {
        return t('agent_w_no_action');
    }

    return summary;
  };

  const onSubmit = async (data: AssistantFormValues) => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    
    const prompt = data.prompt.trim();
    if (!prompt) return;

    const userMessage: Message = { role: 'user', content: prompt, agentMode };
    setCurrentConversation(prev => [...prev, userMessage]);
    form.reset();
    setIsThinking(true);

    let assistantMessage: Message;

    try {
        if (agentMode === 'wise') {
            const historyForApi = currentConversation
                .filter(m => m.agentMode === 'wise' && !m.isError)
                .map(m => ({role: m.role, content: m.content}));

            const input: ExpenseAssistantInput = {
                question: prompt,
                history: historyForApi,
                language: locale,
                currency: currency,
                userName: user?.fullName || 'User',
                financialData: { income, expenses, transactions, budgets, savingsGoals }
            };
            const result = await askExpenseAssistant(input);
            assistantMessage = { role: 'model', content: result.answer, agentMode };

        } else { // AgentW mode
             const input: AgentWInput = {
                prompt,
                currency,
                budgets,
                savingsGoals
            };
            const result = await runAgentW(input);
            const summary = processAgentWResponse(result);
            assistantMessage = { role: 'model', content: summary, agentMode };
            toast.success(t('agent_w_success'));
        }
    } catch (error) {
        console.error('AI assistant failed:', error);
        assistantMessage = { role: 'model', content: t('assistant_error_desc'), agentMode, isError: true };
    } finally {
        setCurrentConversation(prev => [...prev, assistantMessage]);
        setIsThinking(false);
    }
  };
  
  const placeholderText = agentMode === 'wise' 
    ? t('ask_a_question_placeholder')
    : t('agent_w_placeholder');

  if (!isClient || !user) {
    return (
      <div className="flex flex-col h-full bg-background md:bg-transparent p-4">
        <Skeleton className="h-10 w-1/2 mb-4" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-20 w-full mt-4" />
      </div>
    );
  }

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
        <div className="h-full">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-4 md:p-6 space-y-6 pb-8">
                {currentConversation.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'model' && (
                      <Avatar className="h-8 w-8">
                         <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(`rounded-lg px-4 py-2 max-w-sm`, 
                        message.role === 'user' ? 'bg-primary text-primary-foreground'
                        : message.isError ? 'bg-destructive text-destructive-foreground'
                        : message.agentMode === 'agent' ? 'bg-accent text-accent-foreground' : 'bg-muted'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user ? user.fullName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
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
                      <span className="text-sm text-muted-foreground italic">{t('thinking_in_progress')}</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
        </div>
      </div>

      <footer className='p-4 md:p-6 border-t space-y-4 flex-shrink-0 bg-background'>
        {conversationHistory.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>{t('history_button')}</AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-32">
                  <div className='space-y-2 pr-2'>
                    {conversationHistory.map((convo, index) => (
                      <div key={index} className="p-2 bg-muted/50 rounded-md text-sm flex justify-between items-center gap-2">
                        <span
                          className="flex-grow cursor-pointer hover:text-primary overflow-hidden text-ellipsis whitespace-nowrap min-w-0"
                          onClick={() => {
                            setConversationHistory(prev => prev.filter((_, i) => i !== index));
                            if (currentConversation.length > 0) {
                              setConversationHistory(prev => [currentConversation, ...prev]);
                            }
                            setCurrentConversation(convo);
                          }}
                        >
                          {convo.find(m => m.role === 'user')?.content || convo[0]?.content || t('empty_conversation')}
                        </span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                               <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                                    <Trash2 className="h-6 w-6 text-red-600" />
                                </div>
                              <AlertDialogTitle>{t('are_you_sure')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('history_delete_confirmation')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteConversationFromHistory(index)} className="bg-destructive hover:bg-destructive/90">
                                {t('delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        <div className="grid grid-cols-2 gap-2 mb-2">
            <Button variant={agentMode === 'wise' ? 'secondary' : 'ghost'} onClick={() => setAgentMode('wise')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Conseil
            </Button>
            <Button variant={agentMode === 'agent' ? 'secondary' : 'ghost'} onClick={() => setAgentMode('agent')}>
                <ScanLine className="mr-2 h-4 w-4" />
                Agent W
            </Button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-start gap-2"
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
                    <Textarea
                      ref={textareaRef}
                      rows={1}
                      placeholder={placeholderText}
                      {...field}
                      disabled={isThinking}
                      className={cn(
                        "resize-none overflow-hidden pr-10 transition-colors max-h-36",
                        agentMode === 'agent' && 'bg-primary/10 border-primary/50 focus-visible:ring-primary/50'
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={isThinking || !form.formState.isValid}>
              {isThinking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </Form>
      </footer>
    </div>
  );
}

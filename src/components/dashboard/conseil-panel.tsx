// src/components/dashboard/conseil-panel.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { runAgentW } from '@/ai/flows/wise-agent';
import type { AgentWOutput } from '@/ai/flows/wise-agent';
import { askExpenseAssistant } from '@/ai/flows/expense-assistant';
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
import { useTransactions } from '@/context/transactions-context';
import { useBudgets } from '@/context/budget-context';
import { useSavings } from '@/context/savings-context';
import type { Transaction } from '@/types/transaction';
import type { Budget } from '@/types/budget';
import type { SavingsGoal } from '@/types/savings-goal';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';


const assistantSchema = z.object({
  prompt: z.string().min(1, 'Veuillez entrer une question.'),
});

type AssistantFormValues = z.infer<typeof assistantSchema>;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  agentMode?: AgentMode;
}

type Conversation = Message[];
type AgentMode = 'wise' | 'agent';

const CONVERSATION_HISTORY_KEY = 'wisebil-conversation-history';

export function ConseilPanel() {
  const { t, locale, currency } = useLocale();
  const { transactions, income, expenses, addTransaction } = useTransactions();
  const { budgets, addBudget } = useBudgets();
  const { savingsGoals, addSavingsGoal, addFunds } = useSavings();

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

  // Load conversation from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(CONVERSATION_HISTORY_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        if(Array.isArray(parsedHistory) && parsedHistory.length > 0) {
            setCurrentConversation(parsedHistory[0] || []);
            setConversationHistory(parsedHistory.slice(1));
        }
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
      setConversationHistory(prev => [currentConversation, ...prev].filter(c => c.length > 0));
    }
    setCurrentConversation([]);
  };

  const deleteConversationFromHistory = (indexToDelete: number) => {
    setConversationHistory(prev => prev.filter((_, i) => i !== indexToDelete));
    toast.success(t('history_deleted_success'));
  };

  const processAgentW = async (prompt: string) => {
    setIsThinking(true);
    const userMessage: Message = { role: 'user', content: prompt, agentMode };
    setCurrentConversation(prev => [...prev, userMessage]);
    form.reset();
    
    try {
      const aiResponse = await runAgentW({
        prompt,
        currency,
        budgets,
        savingsGoals
      });
      
      const { incomes, expenses: extractedExpenses, newBudgets, newSavingsGoals, savingsContributions } = aiResponse;

      const actions: string[] = [];

      // Add incomes
      for (const income of incomes) {
        const newTransaction: Transaction = {
          id: uuidv4(),
          type: 'income', ...income,
          date: income.date ? new Date(income.date).toISOString() : new Date().toISOString(),
        };
        await addTransaction(newTransaction);
        actions.push(`- Revenu ajouté : ${income.description} (${income.amount})`);
      }

      // Add expenses
      for (const expense of extractedExpenses) {
        const newTransaction: Transaction = {
          id: uuidv4(),
          type: 'expense', ...expense,
          date: expense.date ? new Date(expense.date).toISOString() : new Date().toISOString(),
        };
        await addTransaction(newTransaction);
        actions.push(`- Dépense ajoutée : ${expense.description} (${expense.amount})`);
      }

      // Create new budgets
      for (const budget of newBudgets) {
        const newBudgetItem: Budget = { ...budget, id: uuidv4() };
        await addBudget(newBudgetItem);
        actions.push(`- Budget créé : ${budget.name} (${budget.amount})`);
      }
      
      // Create new savings goals
      for (const goal of newSavingsGoals) {
        const newGoalItem: SavingsGoal = { ...goal, id: uuidv4(), currentAmount: goal.currentAmount ?? 0 };
        await addSavingsGoal(newGoalItem);
        actions.push(`- Objectif d'épargne créé : ${goal.name} (${goal.targetAmount})`);
      }

      // Add funds to savings
      for (const contribution of savingsContributions) {
        await addFunds(contribution.goalName, contribution.amount);
         actions.push(`- Fonds ajouté à l'épargne '${contribution.goalName}' : ${contribution.amount}`);
      }

      const summaryMessage = actions.length > 0
        ? `J'ai terminé les actions suivantes :\n${actions.join('\n')}`
        : "Je n'ai détecté aucune action à effectuer dans votre message.";

      const assistantMessage: Message = { role: 'assistant', content: summaryMessage, agentMode };
      setCurrentConversation(prev => [...prev, assistantMessage]);
      toast.success(actions.length > 0 ? "Actions effectuées avec succès !" : "Aucune action détectée.");

    } catch (error) {
      console.error('Agent W failed:', error);
      const errorMessage = `Désolé, je n'ai pas pu traiter votre demande. Détails: ${error instanceof Error ? error.message : String(error)}`;
      const assistantMessage: Message = { role: 'assistant', content: errorMessage, agentMode };
      setCurrentConversation(prev => [...prev, assistantMessage]);
      toast.error("L'agent W a rencontré une erreur.");
    } finally {
      setIsThinking(false);
    }
  };


  const processWiseAssistant = async (prompt: string) => {
    const userMessage: Message = { role: 'user', content: prompt, agentMode };
    setCurrentConversation(prev => [...prev, userMessage]);
    setIsThinking(true);
    form.reset();
  
    try {
      const result = await askExpenseAssistant({
        question: prompt,
        history: currentConversation.filter(m => m.agentMode === 'wise').map(m => ({role: m.role, content: m.content})),
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

      const assistantMessage: Message = { role: 'assistant', content: result.answer, agentMode };
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
    if (!prompt) return;

    if (agentMode === 'agent') {
      await processAgentW(prompt);
    } else {
      await processWiseAssistant(prompt);
    }
  };
  
  const placeholderText = agentMode === 'wise' 
    ? t('ask_a_question_placeholder')
    : "Ex: Hier j'ai acheté un café à 1500...";

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
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8">
                         <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(`rounded-lg px-4 py-2 max-w-sm`, 
                        message.role === 'user' ? 'bg-primary text-primary-foreground'
                        : message.agentMode === 'agent' ? 'bg-accent text-accent-foreground' : 'bg-muted'
                      )}
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
                          {convo[0]?.content || t('empty_conversation')}
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

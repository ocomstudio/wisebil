// src/components/dashboard/conseil-panel.tsx
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
import { Loader2, Send, PlusCircle, Mic, BrainCircuit, Bot, MessageSquare, ScanLine, Trash2, X, Check, Play, Pause, Trash } from 'lucide-react';
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
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import type { TranscribeAudioInput, TranscribeAudioOutput } from '@/types/ai-schemas';
import { useTransactions } from '@/context/transactions-context';
import { useBudgets } from '@/context/budget-context';
import { useSavings } from '@/context/savings-context';
import { v4 as uuidv4 } from "uuid";
import type { ExpenseAssistantInput, AgentWInput, AgentWOutput } from '@/types/ai-schemas';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const assistantSchema = z.object({
  prompt: z.string().min(1, 'Veuillez entrer une question.'),
});

type AssistantFormValues = z.infer<typeof assistantSchema>;

interface Message {
  role: 'user' | 'model';
  type: 'text' | 'audio';
  content: string;
  audioUrl?: string;
  agentMode?: AgentMode;
  isError?: boolean;
}

type Conversation = Message[];
type AgentMode = 'wise' | 'agent';

interface ConversationHistory {
    wise: {
      current: Conversation;
      history: Conversation[];
    },
    agentW: {
      current: Conversation;
      history: Conversation[];
    }
}

const AudioPlayer = ({ src }: { src: string }) => {
    const audioPlayerRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const togglePlay = () => {
      if (audioPlayerRef.current) {
        if (isPlaying) {
          audioPlayerRef.current.pause();
        } else {
          audioPlayerRef.current.play();
        }
      }
    };
    
    return (
      <div className="flex items-center gap-2">
        <audio
          ref={audioPlayerRef}
          src={src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onCanPlay={() => setIsReady(true)}
          className="hidden"
          preload="auto"
        />
        <Button variant="ghost" size="icon" onClick={togglePlay} disabled={!isReady} className="h-8 w-8">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="w-full h-1 bg-muted-foreground/30 rounded-full">
            <div className="h-1 bg-primary rounded-full" style={{width: '20%'}}></div>
        </div>
      </div>
    );
};


export function ConseilPanel() {
  const { t, locale, currency, formatCurrency } = useLocale();
  const { user } = useAuth();
  const { transactions, income, expenses, addTransaction } = useTransactions();
  const { budgets, addBudget } = useBudgets();
  const { savingsGoals, addSavingsGoal, addFunds } = useSavings();

  const [isClient, setIsClient] = useState(false);
  
  const [wiseConversation, setWiseConversation] = useState<Conversation>([]);
  const [wiseHistory, setWiseHistory] = useState<Conversation[]>([]);
  const [agentWConversation, setAgentWConversation] = useState<Conversation>([]);
  const [agentWHistory, setAgentWHistory] = useState<Conversation[]>([]);

  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [agentMode, setAgentMode] = useState<AgentMode>('wise');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showDictationUI, setShowDictationUI] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast: uiToast } = useToast();
  
  const currentConversation = agentMode === 'wise' ? wiseConversation : agentWConversation;
  const conversationHistory = agentMode === 'wise' ? wiseHistory : agentWHistory;
  const setCurrentConversation = agentMode === 'wise' ? setWiseConversation : setAgentWConversation;
  const setConversationHistory = agentMode === 'wise' ? setWiseHistory : setAgentWHistory;


  useEffect(() => {
    setIsClient(true);
  }, []);

  const getUserDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [user]);

  // Load conversation from Firestore on initial render
  useEffect(() => {
    if (!isClient || !user) return;
    
    const fetchHistory = async () => {
      const userDocRef = getUserDocRef();
      if (!userDocRef) return;
      try {
        const docSnap = await getDoc(userDocRef);
        const loadedHistory = docSnap.data();
        if (loadedHistory && loadedHistory.conversations) {
          const conversationData = loadedHistory.conversations as ConversationHistory;
          setWiseConversation(conversationData.wise?.current || []);
          setWiseHistory(conversationData.wise?.history || []);
          setAgentWConversation(conversationData.agentW?.current || []);
          setAgentWHistory(conversationData.agentW?.history || []);
        } else {
           setWiseConversation([{
                role: 'model',
                type: 'text',
                content: t('assistant_welcome_message').replace('{{name}}', user?.displayName?.split(' ')[0] || 'Utilisateur'),
                agentMode: 'wise'
            }]);
        }
      } catch (error) {
        console.error("Failed to load conversation history from Firestore", error);
      }
    };
    fetchHistory();
  }, [isClient, user, t, getUserDocRef]);

  // Save conversation to Firestore whenever it changes
  useEffect(() => {
    if (!isClient || !user || (!wiseConversation && !agentWConversation)) return;
    
    const saveHistory = async () => {
        const userDocRef = getUserDocRef();
        if (!userDocRef) return;
        
        try {
            const historyToSave: ConversationHistory = {
                wise: { current: wiseConversation, history: wiseHistory },
                agentW: { current: agentWConversation, history: agentWHistory }
            };
            
            await setDoc(userDocRef, { conversations: historyToSave }, { merge: true });
        } catch (error) {
            console.error("Failed to save conversation history to Firestore", error);
        }
    }
    // Debounce saving to avoid too many writes
    const timer = setTimeout(saveHistory, 1000);
    return () => clearTimeout(timer);
  }, [wiseConversation, wiseHistory, agentWConversation, agentWHistory, isClient, user, getUserDocRef]);

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
  
  const startListening = useCallback(async () => {
    if (isListening) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
             // Stop all media tracks to turn off the mic indicator
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsListening(true);
        setShowDictationUI(true);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        uiToast({ variant: 'destructive', title: t('listening_error') });
    }
  }, [isListening, uiToast, t]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
        mediaRecorderRef.current.stop();
        setIsListening(false);
    }
  }, [isListening]);
  
  const handleDictationSubmit = async () => {
    if (!audioUrl) return;

    setShowDictationUI(false);
    
    const userMessage: Message = { role: 'user', type: 'audio', content: '', audioUrl: audioUrl, agentMode };
    setCurrentConversation(prev => [...prev, userMessage]);
    setAudioUrl(null);
    
    setIsThinking(true);
    let assistantMessage: Message;

    try {
        const audioBlob = await fetch(audioUrl).then(r => r.blob());
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;

            try {
                const input: TranscribeAudioInput = { audioDataUri: base64Audio };
                const { transcript } = await transcribeAudio(input);

                if (!transcript) {
                  throw new Error("Empty transcript returned.");
                }

                const agentWInput: AgentWInput = {
                    prompt: transcript,
                    currency,
                    budgets,
                    savingsGoals
                };
                const result = await runAgentW(agentWInput);
                const summary = processAgentWResponse(result);
                assistantMessage = { role: 'model', type: 'text', content: summary, agentMode };
                toast.success(t('agent_w_success'));
            } catch (error) {
                console.error("Error during transcription or agent processing:", error);
                assistantMessage = { role: 'model', type: 'text', content: t('assistant_error_desc'), agentMode, isError: true };
            } finally {
                setCurrentConversation(prev => [...prev, assistantMessage]);
                setIsThinking(false);
            }
        };
    } catch(error) {
        console.error("Error fetching audio blob:", error);
        assistantMessage = { role: 'model', type: 'text', content: t('assistant_error_desc'), agentMode, isError: true };
        setCurrentConversation(prev => [...prev, assistantMessage]);
        setIsThinking(false);
    }
  };

  const resetAudio = () => {
    setAudioUrl(null);
    setShowDictationUI(false);
    stopListening();
  }

  const handleNewConversation = () => {
    if (currentConversation.length > 0 && !(currentConversation.length === 1 && currentConversation[0].role === 'model')) {
      setConversationHistory(prev => [currentConversation, ...prev].filter(c => c.length > 0));
    }
    setCurrentConversation([{
        role: 'model',
        type: 'text',
        content: t('assistant_welcome_message').replace('{{name}}', user?.displayName?.split(' ')[0] || 'Utilisateur'),
        agentMode: agentMode,
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
    const prompt = data.prompt.trim();
    if (!prompt) return;

    const userMessage: Message = { role: 'user', type: 'text', content: prompt, agentMode };
    setCurrentConversation(prev => [...prev, userMessage]);
    form.reset();
    setIsThinking(true);

    let assistantMessage: Message;

    try {
        if (agentMode === 'wise') {
            const historyForApi = currentConversation
                .filter(m => m.agentMode === 'wise' && !m.isError)
                .map(m => ({role: m.role as 'user' | 'model', content: m.content}));

            const input: ExpenseAssistantInput = {
                question: prompt,
                history: historyForApi,
                language: locale,
                currency: currency,
                userName: user?.displayName || 'User',
                financialData: { income, expenses, transactions, budgets, savingsGoals }
            };
            const result = await askExpenseAssistant(input);
            assistantMessage = { role: 'model', type: 'text', content: result.answer, agentMode };

        } else { // AgentW mode
             const input: AgentWInput = {
                prompt,
                currency,
                budgets,
                savingsGoals
            };
            const result = await runAgentW(input);
            const summary = processAgentWResponse(result);
            assistantMessage = { role: 'model', type: 'text', content: summary, agentMode };
            toast.success(t('agent_w_success'));
        }
        setCurrentConversation(prev => [...prev, assistantMessage]);
    } catch (error) {
        assistantMessage = { role: 'model', type: 'text', content: t('assistant_error_desc'), agentMode, isError: true };
        setCurrentConversation(prev => [...prev, assistantMessage]);
    } finally {
        setIsThinking(false);
    }
  };
  
  const placeholderText = agentMode === 'wise' 
    ? t('ask_a_question_placeholder')
    : t('agent_w_placeholder');
    
  const pageTitle = agentMode === 'wise' ? `${t('nav_advice')} IA` : 'Agent W';

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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
        return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }
  
  const AudioWaveform = () => (
    <div className="flex items-center justify-center gap-1 h-10">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="w-1 bg-primary/80 rounded-full"
          style={{ 
            height: `${Math.random() * 80 + 20}%`,
            animation: `wave 1.2s ease-in-out ${i * 0.1}s infinite alternate`
          }}
        ></div>
      ))}
      <style jsx>{`
        @keyframes wave {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );

  if (showDictationUI) {
    return (
      <div className="fixed inset-0 bg-background/95 z-50 flex flex-col" style={{ height: '100svh' }}>
        <header className="flex justify-end p-4 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={resetAudio}>
                <X className="h-6 w-6" />
            </Button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
                <p className="text-muted-foreground">{isListening ? t('listening') : t('audio_recorded')}</p>
                
                <div className="relative flex items-center justify-center h-48 w-48">
                    {isListening ? (
                       <>
                         <div className="absolute h-full w-full bg-primary/20 rounded-full animate-pulse"></div>
                         <div className="h-32 w-32 bg-primary rounded-full flex items-center justify-center">
                             <Mic className="h-16 w-16 text-primary-foreground"/>
                         </div>
                       </>
                    ) : (
                      audioUrl && (
                        <div className="flex flex-col items-center gap-4">
                          <AudioPlayer src={audioUrl} />
                           <Button size="sm" variant="ghost" onClick={resetAudio}>
                              <Trash className="mr-2 h-4 w-4"/>
                              {t('record_again')}
                          </Button>
                        </div>
                      )
                    )}
                </div>
            </div>
            
            <div className="w-full max-w-lg min-h-[6rem] px-4 flex flex-col items-center justify-center gap-4 pb-8">
              {isListening && <AudioWaveform />}
              {isListening ? (
                  <Button size="lg" variant="destructive" className="rounded-full h-16 w-16 p-0" onClick={stopListening}>
                      <Pause className="h-8 w-8" />
                  </Button>
              ) : (
                  <Button size="lg" className="rounded-full h-16 w-16 p-0" onClick={handleDictationSubmit} disabled={!audioUrl}>
                      <Check className="h-8 w-8" />
                  </Button>
              )}
            </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background md:bg-transparent">
      <header className='p-4 md:p-6 border-b flex justify-between items-center flex-shrink-0'>
        <h1 className="text-xl font-bold font-headline">{pageTitle}</h1>
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
                      {message.type === 'audio' && message.audioUrl ? (
                         <AudioPlayer src={message.audioUrl} />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
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
                      <div key={index} className="grid grid-cols-[1fr_auto] items-center gap-2 p-2 bg-muted/50 rounded-md text-sm">
                        <span
                          className="truncate cursor-pointer hover:text-primary"
                          onClick={() => {
                            setConversationHistory(prev => {
                                const newHistory = [...prev];
                                newHistory.splice(index, 1);
                                if (currentConversation && currentConversation.length > 1) {
                                    newHistory.unshift(currentConversation);
                                }
                                return newHistory;
                            });
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
             {agentMode === 'agent' && (
              <Button type="button" size="icon" variant={"outline"} onClick={startListening} disabled={isThinking || isListening}>
                 <Mic className="h-5 w-5" />
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

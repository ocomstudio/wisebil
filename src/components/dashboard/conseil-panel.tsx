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
import { Loader2, Send, PlusCircle, Mic, BrainCircuit, Bot, MessageSquare, ScanLine, Trash2, X, Check, Play, Pause, Trash, Pencil, Sparkles, TrendingDown, TrendingUp, PiggyBank, Briefcase } from 'lucide-react';
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
import type { TranscribeAudioInput, AgentWTransaction, AgentWNewBudget, AgentWNewSavingsGoal } from '@/types/ai-schemas';
import { useTransactions } from '@/context/transactions-context';
import { useBudgets } from '@/context/budget-context';
import { useSavings } from '@/context/savings-context';
import { v4 as uuidv4 } from "uuid";
import type { ExpenseAssistantInput, AgentWInput, AgentWOutput } from '@/types/ai-schemas';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const assistantSchema = z.object({
  prompt: z.string().min(1, 'Veuillez entrer une question.'),
});

type AssistantFormValues = z.infer<typeof assistantSchema>;

interface AugmentedAgentWOutput extends AgentWOutput {
    transactions?: (AgentWTransaction & { id: string })[];
    newBudgets?: (AgentWNewBudget & { id: string })[];
    newSavingsGoals?: (AgentWNewSavingsGoal & { id: string })[];
}

interface Message {
  id: string;
  role: 'user' | 'model';
  type: 'text' | 'audio' | 'agent-review';
  content: string;
  agentData?: AugmentedAgentWOutput;
  isProcessed?: boolean;
}

type Conversation = Message[];
type AgentMode = 'wise' | 'agent';

// Changed history to be an object instead of an array of arrays
type ConversationHistoryObject = { [timestamp: string]: Conversation };

interface ConversationHistory {
    wise: {
      current: Conversation;
      history: ConversationHistoryObject;
    },
    agentW: {
      current: Conversation;
      history: ConversationHistoryObject;
    }
}

const cleanObjectForFirestore = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(cleanObjectForFirestore);
    }

    const cleanedObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            cleanedObj[key] = cleanObjectForFirestore(obj[key]);
        }
    }
    return cleanedObj;
};


export function ConseilPanel() {
  const { t, locale, currency, formatCurrency } = useLocale();
  const { user } = useAuth();
  const { transactions, income, expenses, addTransaction } = useTransactions();
  const { budgets, addBudget } = useBudgets();
  const { savingsGoals, addSavingsGoal, addFunds } = useSavings();

  const [isClient, setIsClient] = useState(false);
  
  const [wiseConversation, setWiseConversation] = useState<Conversation>([]);
  const [wiseHistory, setWiseHistory] = useState<ConversationHistoryObject>({});
  const [agentWConversation, setAgentWConversation] = useState<Conversation>([]);
  const [agentWHistory, setAgentWHistory] = useState<ConversationHistoryObject>({});

  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [agentMode, setAgentMode] = useState<AgentMode>('wise');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [transcriptForVerification, setTranscriptForVerification] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionMode, setTranscriptionMode] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transcriptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast: uiToast } = useToast();
  
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  
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

  useEffect(() => {
    if (!user || !isClient) return;

    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const loadedHistory = data?.conversations as ConversationHistory | undefined;
            
            const wiseCurrent = loadedHistory?.wise?.current;
            if (wiseCurrent && wiseCurrent.length > 0) {
                setWiseConversation(wiseCurrent);
            } else {
                setWiseConversation([{
                    id: uuidv4(),
                    role: 'model',
                    type: 'text',
                    content: t('assistant_welcome_message').replace('{{name}}', user?.displayName?.split(' ')[0] || 'Utilisateur'),
                }]);
            }
            setWiseHistory(loadedHistory?.wise?.history || {});

            const agentWCurrent = loadedHistory?.agentW?.current;
            if (agentWCurrent && agentWCurrent.length > 0) {
                setAgentWConversation(agentWCurrent);
            } else {
                 setAgentWConversation([]);
            }
            setAgentWHistory(loadedHistory?.agentW?.history || {});

        } else {
            // Document doesn't exist, set initial welcome message for Wise
            setWiseConversation([{
                id: uuidv4(),
                role: 'model',
                type: 'text',
                content: t('assistant_welcome_message').replace('{{name}}', user?.displayName?.split(' ')[0] || 'Utilisateur'),
            }]);
        }
    }, (error) => {
        console.error("Firestore snapshot error:", error);
    });

    return () => unsubscribe();
}, [isClient, user, t, getUserDocRef]);


  const saveCurrentConversation = async () => {
    const userDocRef = getUserDocRef();
    if (!userDocRef) return;
  
    try {
      const fieldToUpdate = agentMode === 'wise' ? 'conversations.wise' : 'conversations.agentW';
      await setDoc(userDocRef, {
        conversations: {
          [agentMode]: {
            current: cleanObjectForFirestore(currentConversation),
            history: cleanObjectForFirestore(conversationHistory)
          }
        }
      }, { merge: true });
    } catch (error) {
      console.error("Failed to save conversation to Firestore:", error);
    }
  };
  
  const archiveCurrentConversation = () => {
    if (currentConversation.length === 0 || (currentConversation.length === 1 && currentConversation[0].role === 'model')) {
        return; // Don't archive empty or default conversations
    }
    const newHistory = { ...conversationHistory };
    newHistory[new Date().toISOString()] = currentConversation;
    setConversationHistory(newHistory);
  };
  
  const handleNewConversation = async () => {
    archiveCurrentConversation();

    if (agentMode === 'wise') {
        setCurrentConversation([{
            id: uuidv4(),
            role: 'model',
            type: 'text',
            content: t('assistant_welcome_message').replace('{{name}}', user?.displayName?.split(' ')[0] || 'Utilisateur'),
        }]);
    } else {
        setCurrentConversation([]);
    }

    // Save the new state (archived old convo, new empty current convo)
     const userDocRef = getUserDocRef();
     if (!userDocRef) return;
     try {
       await setDoc(userDocRef, {
         conversations: {
           [agentMode]: {
             current: agentMode === 'wise' ? [{id: uuidv4(), role: 'model', type: 'text', content: t('assistant_welcome_message').replace('{{name}}', user?.displayName?.split(' ')[0] || 'Utilisateur')}] : [],
             history: cleanObjectForFirestore(conversationHistory) 
           }
         }
       }, { merge: true });
     } catch (error) {
       console.error("Failed to start new conversation in Firestore:", error);
     }
  };


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
    if (transcriptTextareaRef.current) {
        transcriptTextareaRef.current.style.height = 'auto';
        transcriptTextareaRef.current.style.height = `${transcriptTextareaRef.current.scrollHeight}px`;
    }
  }, [transcriptForVerification]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollEl = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollEl) {
        scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [currentConversation.length, isThinking]);
  
    const acquireWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                wakeLockRef.current.addEventListener('release', () => {
                    // console.log('Wake Lock was released');
                });
                // console.log('Wake Lock is active');
            } catch (err: any) {
                console.error(`${err.name}, ${err.message}`);
            }
        }
    }, []);

    const releaseWakeLock = useCallback(() => {
        if (wakeLockRef.current) {
            wakeLockRef.current.release();
            wakeLockRef.current = null;
        }
    }, []);
  
  const startListening = useCallback(async () => {
    if (isListening || transcriptionMode) return;

    try {
        await acquireWakeLock();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setTranscriptionMode(true);
            setIsTranscribing(true);

            try {
                 const reader = new FileReader();
                 reader.onloadend = async () => {
                     const base64Audio = reader.result as string;
                     const input: TranscribeAudioInput = { audioDataUri: base64Audio };
                     const { transcript } = await transcribeAudio(input);
                     setTranscriptForVerification(transcript || "");
                     setIsTranscribing(false);
                     releaseWakeLock(); 
                 };
                 reader.onerror = () => { throw new Error("Failed to read audio file."); }
                 reader.readAsDataURL(audioBlob);
            } catch (error) {
                console.error("Error during transcription:", error);
                uiToast({ variant: 'destructive', title: t('transcription_error_title'), description: t('transcription_error_desc') });
                resetAudioFlow();
            }
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsListening(true);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        uiToast({ variant: 'destructive', title: t('listening_error') });
        releaseWakeLock();
    }
  }, [isListening, transcriptionMode, uiToast, t, acquireWakeLock, releaseWakeLock]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
        mediaRecorderRef.current.stop();
        setIsListening(false);
        releaseWakeLock();
    }
  }, [isListening, releaseWakeLock]);
  
  const handleVerificationSubmit = async () => {
    const finalTranscript = transcriptForVerification.trim();
    if (!finalTranscript) {
        uiToast({ variant: 'destructive', title: t('error_title'), description: t('empty_transcript_error') });
        return;
    };
    
    resetAudioFlow();
    
    await processAgentWPrompt(finalTranscript);
  };

  const resetAudioFlow = () => {
    setTranscriptionMode(false);
    setTranscriptForVerification('');
    setIsTranscribing(false);
    if(isListening) stopListening();
    releaseWakeLock();
  }

  const deleteConversationFromHistory = (timestamp: string) => {
    const newHistory = { ...conversationHistory };
    delete newHistory[timestamp];
    setConversationHistory(newHistory);
    toast.success(t('history_deleted_success'));
  };

  const processAgentWResponse = (response: AugmentedAgentWOutput, messageId: string) => {
    let itemsAdded = 0;
    
    if (response.transactions?.length) {
        response.transactions.forEach((t: any) => {
            addTransaction({ ...t, id: uuidv4() });
            itemsAdded++;
        });
    }
    if (response.newBudgets?.length) {
        response.newBudgets.forEach((b: any) => {
            addBudget({ ...b, id: uuidv4() });
            itemsAdded++;
        });
    }
    if (response.newSavingsGoals?.length) {
        response.newSavingsGoals.forEach((g: any) => {
            addSavingsGoal({ ...g, id: uuidv4() });
            itemsAdded++;
        });
    }
    if (response.savingsContributions?.length) {
        response.savingsContributions.forEach((c: any) => {
            addFunds(c.goalName, c.amount);
            itemsAdded++;
        });
    }

    if (itemsAdded === 0) {
        const agentMessage: Message = { id: uuidv4(), role: 'model', type: 'text', content: t('agent_w_no_action')};
        setCurrentConversation(prev => [...prev, agentMessage]);
    } else {
        const successMessage = t('agent_w_success_feedback', { count: itemsAdded });
        const agentMessage: Message = { id: uuidv4(), role: 'model', type: 'text', content: successMessage};
        setCurrentConversation(prev => [...prev.map(m => m.id === messageId ? {...m, isProcessed: true} : m), agentMessage]);
        toast.success(t('agent_w_success'));
    }
  };
  
  const processAgentWPrompt = async (prompt: string) => {
    const userMessage: Message = { id: uuidv4(), role: 'user', type: 'text', content: prompt };
    setCurrentConversation(prev => [...prev, userMessage]);
    setIsThinking(true);
    try {
        const agentWInput: AgentWInput = {
            prompt,
            currency,
            budgets,
            savingsGoals,
            language: locale,
        };
        const result = await runAgentW(agentWInput);
        
        const hasActions = (result.transactions && result.transactions.length > 0) || 
                           (result.newBudgets && result.newBudgets.length > 0) ||
                           (result.newSavingsGoals && result.newSavingsGoals.length > 0) ||
                           (result.savingsContributions && result.savingsContributions.length > 0);

        if (hasActions) {
            const augmentedResult: AugmentedAgentWOutput = {
                ...result,
                transactions: result.transactions?.map(t => ({...t, id: uuidv4()})),
                newBudgets: result.newBudgets?.map(b => ({...b, id: uuidv4()})),
                newSavingsGoals: result.newSavingsGoals?.map(g => ({...g, id: uuidv4()})),
                // savingsContributions don't need a client-side ID for display
            }

            const assistantMessage: Message = { 
                id: uuidv4(), 
                role: 'model', 
                type: 'agent-review', 
                content: t('agent_w_review_prompt'),
                agentData: augmentedResult,
                isProcessed: false
            };
            setCurrentConversation(prev => [...prev, assistantMessage]);
        } else {
             const assistantMessage: Message = { id: uuidv4(), role: 'model', type: 'text', content: t('agent_w_no_action') };
             setCurrentConversation(prev => [...prev, assistantMessage]);
        }

    } catch (error) {
        console.error("Error during agent processing:", error);
        const assistantMessage: Message = { id: uuidv4(), role: 'model', type: 'text', content: t('assistant_error_desc') };
        setCurrentConversation(prev => [...prev, assistantMessage]);
    } finally {
        setIsThinking(false);
    }
  }


  const onSubmit = async (data: AssistantFormValues) => {
    const prompt = data.prompt.trim();
    if (!prompt) return;

    form.reset();

    if (agentMode === 'agent') {
        await processAgentWPrompt(prompt);
        return;
    }
    
    // Wise Mode
    const userMessage: Message = { id: uuidv4(), role: 'user', type: 'text', content: prompt };
    setCurrentConversation(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
        const historyForApi = currentConversation
            .filter(m => m.type === 'text' && !(m.role === 'model' && currentConversation.indexOf(m) === 0))
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
        const assistantMessage: Message = { id: uuidv4(), role: 'model', type: 'text', content: result.answer };
        setCurrentConversation(prev => [...prev, assistantMessage]);

    } catch (error) {
        console.error("Error during agent processing:", error);
        const assistantMessage: Message = { id: uuidv4(), role: 'model', type: 'text', content: t('assistant_error_desc') };
        setCurrentConversation(prev => [...prev, assistantMessage]);
    } finally {
        setIsThinking(false);
        saveCurrentConversation();
    }
  };
  
  const placeholderText = agentMode === 'wise' 
    ? t('ask_a_question_placeholder')
    : t('agent_w_placeholder');
    
  const pageTitle = agentMode === 'wise' ? t('nav_advice') : 'Agent W';

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

 const TranscriptionEditor = () => (
    <div className='p-4 md:p-6 border-t space-y-2 flex-shrink-0 bg-background'>
        <div className="relative">
            <Textarea
                ref={transcriptTextareaRef}
                value={transcriptForVerification}
                onChange={(e) => setTranscriptForVerification(e.target.value)}
                placeholder={t('transcription_placeholder')}
                disabled={isTranscribing}
                className="w-full resize-none pr-10 text-base"
                rows={1}
            />
            {isTranscribing && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}
        </div>
        <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={resetAudioFlow}>{t('cancel')}</Button>
            <Button onClick={handleVerificationSubmit} disabled={isTranscribing || isThinking}>
                <Send className="mr-2 h-4 w-4" />
                {t('validate_button')}
            </Button>
        </div>
    </div>
);

const AgentWReviewCard = ({ message }: { message: Message }) => {
    if (!message.agentData) return null;

    const { transactions = [], newBudgets = [], newSavingsGoals = [], savingsContributions = [] } = message.agentData;

    const handleConfirm = () => {
        if (message.agentData) {
            processAgentWResponse(message.agentData, message.id);
        }
    };

    const handleCancel = () => {
        setCurrentConversation(prev => prev.map(m => 
            m.id === message.id ? { ...m, isProcessed: true, content: t('agent_w_actions_cancelled') } : m
        ));
        toast.error(t('agent_w_actions_cancelled'));
    };

    return (
        <div className="p-4 rounded-lg bg-accent/50 border border-primary/20 space-y-4">
            <p className="text-sm font-medium">{message.isProcessed ? t('agent_w_actions_cancelled') : message.content}</p>
            <div className="space-y-2 text-xs">
                {transactions.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                       {item.amount >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                       <span>{item.description}</span>
                       <span className="ml-auto font-semibold">{formatCurrency(Math.abs(item.amount))}</span>
                    </div>
                ))}
                {newBudgets.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                       <Briefcase className="h-4 w-4 text-blue-500" />
                       <span>{t('budget')}: {item.name}</span>
                       <span className="ml-auto font-semibold">{formatCurrency(item.amount)}</span>
                    </div>
                ))}
                 {newSavingsGoals.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                       <PiggyBank className="h-4 w-4 text-pink-500" />
                       <span>{t('goal')}: {item.name}</span>
                       <span className="ml-auto font-semibold">{formatCurrency(item.targetAmount)}</span>
                    </div>
                ))}
                 {savingsContributions.map((item, index) => (
                    <div key={item.id || `sc-${index}`} className="flex items-center gap-2">
                       <PiggyBank className="h-4 w-4 text-pink-500" />
                       <span>{t('contribution')}: {item.goalName}</span>
                       <span className="ml-auto font-semibold">{formatCurrency(item.amount)}</span>
                    </div>
                ))}
            </div>
            
            {!message.isProcessed && (
                 <div className="flex justify-end gap-2 pt-2 border-t border-primary/20">
                    <Button size="sm" variant="ghost" onClick={handleCancel}>{t('cancel')}</Button>
                    <Button size="sm" onClick={handleConfirm}><Check className="mr-2 h-4 w-4"/> {t('validate_button')}</Button>
                </div>
            )}
        </div>
    );
};


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
                {currentConversation.length === 0 && agentMode === 'agent' && (
                    <div className="text-center text-muted-foreground p-8">
                        <ScanLine className="h-12 w-12 mx-auto mb-4"/>
                        <h3 className="font-semibold text-lg">{t('agent_w_welcome_title')}</h3>
                        <p className="text-sm">{t('agent_w_welcome_desc')}</p>
                    </div>
                )}
                {currentConversation.map((message) => (
                  <div
                    key={message.id}
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
                        : message.type === 'agent-review' ? 'bg-transparent p-0 w-full'
                        : agentMode === 'agent' ? 'bg-accent text-accent-foreground' : 'bg-muted'
                      )}
                    >
                      {message.type === 'agent-review' ? (
                          <AgentWReviewCard message={message} />
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

       {transcriptionMode ? <TranscriptionEditor /> : (
            <footer className='p-4 md:p-6 border-t space-y-4 flex-shrink-0 bg-background'>
                {Object.keys(conversationHistory).length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                    <AccordionTrigger>{t('history_button')}</AccordionTrigger>
                    <AccordionContent>
                        <ScrollArea className="h-32">
                        <div className='space-y-2 pr-2'>
                            {Object.entries(conversationHistory).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([timestamp, convo]) => (
                            <div key={timestamp} className="grid grid-cols-[1fr_auto] items-center gap-2 p-2 bg-muted/50 rounded-md text-sm">
                                <span
                                className="truncate cursor-pointer hover:text-primary"
                                onClick={() => {
                                    archiveCurrentConversation();
                                    setCurrentConversation(convo);
                                    const newHistory = { ...conversationHistory };
                                    delete newHistory[timestamp];
                                    setConversationHistory(newHistory);
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
                                    <AlertDialogAction onClick={() => deleteConversationFromHistory(timestamp)} className="bg-destructive hover:bg-destructive/90">
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
                        {t('nav_advice')}
                    </Button>
                    <Button variant={agentMode === 'agent' ? 'secondary' : 'ghost'} onClick={() => setAgentMode('agent')}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Agent W
                    </Button>
                </div>
                {isListening ? (
                    <div className="flex flex-col items-center gap-2">
                       <AudioWaveform />
                        <Button variant="destructive" onClick={stopListening}>{t('stop_recording_button')}</Button>
                    </div>
                ) : (
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
                )}
            </footer>
       )}
    </div>
  );
}

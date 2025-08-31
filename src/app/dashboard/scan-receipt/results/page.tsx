// src/app/dashboard/scan-receipt/results/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { scanDocument } from '@/ai/flows/scan-document-flow';
import type { AgentWOutput } from '@/types/ai-schemas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/locale-context';
import { useTransactions } from '@/context/transactions-context';
import { useBudgets } from '@/context/budget-context';
import { useSavings } from '@/context/savings-context';
import { Loader2, ArrowLeft, Check, X, Trash2, Pencil, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { expenseCategories, incomeCategories, allCategories } from '@/config/categories';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types/transaction';
import { Skeleton } from '@/components/ui/skeleton';


type EditableTransaction = Omit<Transaction, 'id' | 'type'> & {
    id: string;
    isEditing?: boolean;
    type: 'income' | 'expense' | 'savings';
}

type EditableAgentWOutput = {
    transactions?: EditableTransaction[];
    newBudgets?: (AgentWOutput['newBudgets'][number] & { id: string; isEditing?: boolean })[];
    newSavingsGoals?: (AgentWOutput['newSavingsGoals'][number] & { id: string; isEditing?: boolean })[];
}

export default function ScanResultsPage() {
    const router = useRouter();
    const { t, formatCurrency, getCategoryName, currency } = useLocale();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [results, setResults] = useState<EditableAgentWOutput>({});
    const { addTransaction } = useTransactions();
    const { addBudget } = useBudgets();
    const { savingsGoals, addSavingsGoal, addFunds } = useSavings();

    useEffect(() => {
        const dataUri = sessionStorage.getItem('scannedImageDataUri');
        if (!dataUri) {
            toast({ variant: 'destructive', title: t('error_title'), description: 'No image data found.' });
            router.push('/dashboard');
            return;
        }

        const processScan = async () => {
            try {
                const response = await scanDocument({ photoDataUri: dataUri });
                const editableResponse: EditableAgentWOutput = {};
                
                if (response.transactions) {
                    editableResponse.transactions = response.transactions.map(item => ({
                        ...item,
                        id: uuidv4(),
                        isEditing: false,
                        // Default to expense, user can change it
                        type: 'expense', 
                    }));
                }

                if (response.newBudgets) {
                   editableResponse.newBudgets = response.newBudgets.map(item => ({...item, id: uuidv4(), isEditing: false}));
                }
                
                if (response.newSavingsGoals) {
                    editableResponse.newSavingsGoals = response.newSavingsGoals.map(item => ({...item, id: uuidv4(), isEditing: false}));
                }

                setResults(editableResponse);
            } catch (error) {
                console.error("Error processing scan:", error);
                toast({ variant: 'destructive', title: t('scan_failed_title'), description: t('scan_failed_desc') });
                router.push('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        processScan();
    }, [router, t, toast]);

    const handleUpdate = (id: string, field: string, value: any) => {
        setResults(prev => {
            if (!prev.transactions) return prev;
            const newItems = prev.transactions.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            );
            return { ...prev, transactions: newItems };
        });
    };
    
    const toggleEdit = (id: string) => {
        setResults(prev => {
            if (!prev.transactions) return prev;
            const newItems = prev.transactions.map(item =>
                item.id === id ? { ...item, isEditing: !item.isEditing } : item
            );
            return { ...prev, transactions: newItems };
        });
    };
    
    const handleDelete = (id: string) => {
        setResults(prev => {
            if (!prev.transactions) return prev;
            return {
                ...prev,
                transactions: prev.transactions.filter(item => item.id !== id)
            };
        });
    };


    const handleSave = async () => {
        setIsSaving(true);
        let itemsAdded = 0;
        try {
            const promises: Promise<any>[] = [];
            
            if (results.transactions) {
                results.transactions.forEach(t => {
                    if (t.type === 'income' || t.type === 'expense') {
                         promises.push(addTransaction({ ...t, type: t.type }));
                         itemsAdded++;
                    } else if (t.type === 'savings') {
                        // For savings, we treat it as adding funds to a goal. The 'category' field holds the goal ID.
                        if (t.category) {
                            promises.push(addFunds(t.category, t.amount));
                            itemsAdded++;
                        }
                    }
                });
            }

            if (results.newBudgets) {
                results.newBudgets.forEach(b => promises.push(addBudget(b)));
                 itemsAdded += results.newBudgets.length;
            }
            if (results.newSavingsGoals) {
                results.newSavingsGoals.forEach(g => promises.push(addSavingsGoal(g)));
                 itemsAdded += results.newSavingsGoals.length;
            }
            
            await Promise.all(promises);
            toast({ title: t('scan_save_success_title'), description: t('scan_save_success_desc', { count: itemsAdded }) });
            router.push('/dashboard');
        } catch (error) {
            console.error("Failed to save results:", error);
            toast({ variant: 'destructive', title: t('error_title'), description: t('scan_save_error_desc') });
        } finally {
            setIsSaving(false);
            sessionStorage.removeItem('scannedImageDataUri');
        }
    };
    
    const renderTransactionItem = (item: EditableTransaction) => {
        const categories = item.type === 'income' ? incomeCategories : expenseCategories;
        const showCategorySelect = item.type === 'income' || item.type === 'expense';
        const showSavingsGoalSelect = item.type === 'savings';
        
        if (item.isEditing) {
            return (
                <Card key={item.id} className="p-4 bg-muted/50">
                    <div className="space-y-3">
                        <Input value={item.description} onChange={(e) => handleUpdate(item.id, 'description', e.target.value)} placeholder={t('description_label')} />
                        <Input value={item.amount} type="number" onChange={(e) => handleUpdate(item.id, 'amount', parseFloat(e.target.value) || 0)} placeholder={t('amount_label')} />
                        
                        {showCategorySelect && (
                        <Select value={item.category} onValueChange={(value) => handleUpdate(item.id, 'category', value)}>
                            <SelectTrigger><SelectValue placeholder={t('category_label')} /></SelectTrigger>
                            <SelectContent>
                                {categories.map(c => <SelectItem key={c.name} value={c.name}>{c.emoji} {getCategoryName(c.name)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        )}
                        {showSavingsGoalSelect && (
                        <Select value={item.category} onValueChange={(value) => handleUpdate(item.id, 'category', value)}>
                            <SelectTrigger><SelectValue placeholder={t('scan_select_goal_placeholder')} /></SelectTrigger>
                            <SelectContent>
                            {savingsGoals.map(g => <SelectItem key={g.id} value={g.id}>{g.emoji} {g.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        )}

                        <div className="flex justify-end">
                            <Button size="icon" variant="ghost" onClick={() => toggleEdit(item.id)}><Check className="h-4 w-4 text-primary" /></Button>
                        </div>
                    </div>
                </Card>
            );
        }
        return (
             <Card key={item.id} className="p-4 bg-card shadow-sm">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow space-y-2">
                        <p className="font-semibold text-lg">{item.description}</p>
                        <p className="font-bold text-2xl text-primary">{formatCurrency(item.amount)}</p>
                         {showCategorySelect && <p className="text-sm text-muted-foreground">{getCategoryName(item.category || "Autre")}</p>}
                         {showSavingsGoalSelect && <p className="text-sm text-blue-400">{savingsGoals.find(g => g.id === item.category)?.name || t('scan_select_goal_placeholder')}</p>}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => toggleEdit(item.id)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                     <Button variant={item.type === 'expense' ? 'destructive' : 'outline'} className="h-12 flex-col gap-1" onClick={() => handleUpdate(item.id, 'type', 'expense')}>
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-xs">{t('expenses')}</span>
                    </Button>
                     <Button variant={item.type === 'income' ? 'default' : 'outline'} className={cn("h-12 flex-col gap-1", item.type === 'income' && "bg-green-600 hover:bg-green-700")} onClick={() => handleUpdate(item.id, 'type', 'income')}>
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">{t('income')}</span>
                    </Button>
                     <Button variant={item.type === 'savings' ? 'default' : 'outline'} className={cn("h-12 flex-col gap-1", item.type === 'savings' && "bg-blue-600 hover:bg-blue-700")} onClick={() => handleUpdate(item.id, 'type', 'savings')}>
                        <PiggyBank className="h-4 w-4" />
                        <span className="text-xs">{t('nav_savings')}</span>
                    </Button>
                </div>
                 {showSavingsGoalSelect && (
                    <Select value={item.category} onValueChange={(value) => handleUpdate(item.id, 'category', value)}>
                        <SelectTrigger className="mt-2"><SelectValue placeholder={t('scan_select_goal_placeholder')} /></SelectTrigger>
                        <SelectContent>
                        {savingsGoals.map(g => <SelectItem key={g.id} value={g.id}>{g.emoji} {g.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 )}
            </Card>
        );
    };

    if (isLoading) {
        return (
            <div className="p-4 bg-muted/40 min-h-screen">
                <header className="flex items-center gap-4 pb-4">
                     <Skeleton className="h-10 w-10 rounded-md" />
                     <Skeleton className="h-7 w-40 rounded-md" />
                </header>
                <main className="space-y-4 pb-24">
                     <Skeleton className="h-32 w-full rounded-lg" />
                     <Skeleton className="h-32 w-full rounded-lg" />
                     <Skeleton className="h-32 w-full rounded-lg" />
                </main>
                 <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t grid grid-cols-2 gap-4">
                     <Skeleton className="h-12 w-full rounded-md" />
                     <Skeleton className="h-12 w-full rounded-md" />
                </footer>
            </div>
        )
    }

    const hasResults = results.transactions && results.transactions.length > 0;

    return (
        <div className="p-4 bg-muted/40 min-h-screen">
            <header className="flex items-center gap-4 pb-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold font-headline">{t('scan_results_title')}</h1>
            </header>

            <main className="space-y-4 pb-24">
                { !hasResults && !isLoading && (
                    <Card className="text-center p-8">
                        <CardTitle>{t('scan_no_data_title')}</CardTitle>
                        <CardContent className="pt-4">
                            <p className="text-muted-foreground mt-2">{t('scan_no_data_desc')}</p>
                            <Button className="mt-4" onClick={() => router.push('/dashboard')}>{t('back_to_dashboard')}</Button>
                        </CardContent>
                    </Card>
                )}

                {results.transactions && results.transactions.length > 0 && (
                     results.transactions.map(item => renderTransactionItem(item))
                )}
                 {/* TODO: Add editable views for budgets and savings goals */}
            </main>

            {hasResults && (
                <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t grid grid-cols-2 gap-4">
                    <Button variant="outline" size="lg" onClick={() => router.back()}>
                        <X className="mr-2 h-4 w-4"/> {t('cancel')}
                    </Button>
                    <Button size="lg" disabled={isSaving} onClick={handleSave}>
                        {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                        {t('scan_save_all_button')}
                    </Button>
                </footer>
            )}
        </div>
    )
}

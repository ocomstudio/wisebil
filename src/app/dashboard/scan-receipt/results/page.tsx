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
                toast({ variant: 'destructive', title: 'Scan Failed', description: 'Could not extract information from the document.' });
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
            toast({ title: 'Success!', description: `${itemsAdded} items have been added to your account.` });
            router.push('/dashboard');
        } catch (error) {
            console.error("Failed to save results:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save all items.' });
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
                <div key={item.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <Input value={item.description} onChange={(e) => handleUpdate(item.id, 'description', e.target.value)} placeholder="Description" />
                    <Input value={item.amount} type="number" onChange={(e) => handleUpdate(item.id, 'amount', parseFloat(e.target.value) || 0)} placeholder="Amount" />
                    
                    {showCategorySelect && (
                      <Select value={item.category} onValueChange={(value) => handleUpdate(item.id, 'category', value)}>
                          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                          <SelectContent>
                              {categories.map(c => <SelectItem key={c.name} value={c.name}>{c.emoji} {getCategoryName(c.name)}</SelectItem>)}
                          </SelectContent>
                      </Select>
                    )}
                    {showSavingsGoalSelect && (
                      <Select value={item.category} onValueChange={(value) => handleUpdate(item.id, 'category', value)}>
                        <SelectTrigger><SelectValue placeholder="Select a savings goal" /></SelectTrigger>
                        <SelectContent>
                          {savingsGoals.map(g => <SelectItem key={g.id} value={g.id}>{g.emoji} {g.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}

                    <div className="flex justify-end gap-2">
                         <Button size="icon" variant="ghost" onClick={() => toggleEdit(item.id)}><Check className="h-4 w-4 text-green-500" /></Button>
                    </div>
                </div>
            );
        }
        return (
            <div key={item.id} className="p-3 bg-card rounded-lg shadow-sm">
                <div className="flex gap-4">
                    <div className="flex flex-col gap-2">
                        <Button variant={item.type === 'income' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleUpdate(item.id, 'type', 'income')}><TrendingUp className="h-4 w-4 text-green-500"/></Button>
                        <Button variant={item.type === 'expense' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleUpdate(item.id, 'type', 'expense')}><TrendingDown className="h-4 w-4 text-red-500"/></Button>
                        <Button variant={item.type === 'savings' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleUpdate(item.id, 'type', 'savings')}><PiggyBank className="h-4 w-4 text-blue-500"/></Button>
                    </div>
                    <div className="flex-grow space-y-1">
                        <p className="font-semibold">{item.description}</p>
                        <p className="font-bold text-lg">{formatCurrency(item.amount)}</p>
                        {showCategorySelect && <p className="text-sm text-muted-foreground">{getCategoryName(item.category || "Autre")}</p>}
                        {showSavingsGoalSelect && <p className="text-sm text-blue-400">{savingsGoals.find(g => g.id === item.category)?.name || "Select a goal"}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button size="icon" variant="ghost" onClick={() => toggleEdit(item.id)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-background p-4 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">{t('scanning_button')}...</p>
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
                <h1 className="text-xl font-bold font-headline">Scan Results</h1>
            </header>

            <main className="space-y-6 pb-24">
                { !hasResults && !isLoading && (
                    <Card className="text-center p-8">
                        <CardTitle>No financial data found</CardTitle>
                        <CardContent className="pt-4">
                            <p className="text-muted-foreground mt-2">We couldn't detect any financial actions on your document.</p>
                            <Button className="mt-4" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                        </CardContent>
                    </Card>
                )}

                {results.transactions && results.transactions.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Transactions to classify</CardTitle></CardHeader>
                        <CardContent className="space-y-4">{results.transactions.map(item => renderTransactionItem(item))}</CardContent>
                    </Card>
                )}
                 {/* TODO: Add editable views for budgets and savings goals */}
            </main>

            {hasResults && (
                <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t grid grid-cols-2 gap-4">
                    <Button variant="outline" size="lg" onClick={() => router.back()}>
                        <X className="mr-2 h-4 w-4"/> Cancel
                    </Button>
                    <Button size="lg" disabled={isSaving} onClick={handleSave}>
                        {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                        Save All
                    </Button>
                </footer>
            )}
        </div>
    )
}

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
import { Loader2, ArrowLeft, Check, X, Trash2, Pencil } from 'lucide-react';
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
import { expenseCategories, incomeCategories } from '@/config/categories';

type EditableAgentWOutput = {
    [K in keyof AgentWOutput]?: (AgentWOutput[K][number] & { id: string; isEditing?: boolean })[]
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
    const { addSavingsGoal, addFunds } = useSavings();

    useEffect(() => {
        const dataUri = sessionStorage.getItem('scannedImageDataUri');
        if (!dataUri) {
            toast({ variant: 'destructive', title: t('error_title'), description: 'No image data found.' });
            router.push('/dashboard/scan-receipt');
            return;
        }

        const processScan = async () => {
            try {
                const response = await scanDocument({ photoDataUri: dataUri });
                const editableResponse: EditableAgentWOutput = {};
                for (const key in response) {
                    if (Array.isArray(response[key as keyof AgentWOutput])) {
                        editableResponse[key as keyof AgentWOutput] = response[key as keyof AgentWOutput]!.map(item => ({
                            ...item,
                            id: uuidv4(),
                            isEditing: false,
                        }));
                    }
                }
                setResults(editableResponse);
            } catch (error) {
                console.error("Error processing scan:", error);
                toast({ variant: 'destructive', title: 'Scan Failed', description: 'Could not extract information from the document.' });
                router.push('/dashboard/scan-receipt');
            } finally {
                setIsLoading(false);
            }
        };

        processScan();
    }, [router, t, toast]);

    const handleUpdate = (key: keyof EditableAgentWOutput, id: string, field: string, value: any) => {
        setResults(prev => {
            if (!prev[key]) return prev;
            const newItems = prev[key]!.map(item => 
                item.id === id ? { ...item, [field]: value } : item
            );
            return { ...prev, [key]: newItems };
        });
    };
    
    const toggleEdit = (key: keyof EditableAgentWOutput, id: string) => {
        setResults(prev => {
            if (!prev[key]) return prev;
            const newItems = prev[key]!.map(item =>
                item.id === id ? { ...item, isEditing: !item.isEditing } : item
            );
            return { ...prev, [key]: newItems };
        });
    };
    
    const handleDelete = (key: keyof EditableAgentWOutput, id: string) => {
        setResults(prev => {
            if (!prev[key]) return prev;
            return {
                ...prev,
                [key]: prev[key]!.filter(item => item.id !== id)
            };
        });
    };


    const handleSave = async () => {
        setIsSaving(true);
        let itemsAdded = 0;
        try {
            const promises: Promise<any>[] = [];
            if (results.incomes) {
                results.incomes.forEach(i => promises.push(addTransaction({ ...i, type: 'income' })));
                itemsAdded += results.incomes.length;
            }
            if (results.expenses) {
                results.expenses.forEach(e => promises.push(addTransaction({ ...e, type: 'expense' })));
                 itemsAdded += results.expenses.length;
            }
            if (results.newBudgets) {
                results.newBudgets.forEach(b => promises.push(addBudget(b)));
                 itemsAdded += results.newBudgets.length;
            }
            if (results.newSavingsGoals) {
                results.newSavingsGoals.forEach(g => promises.push(addSavingsGoal(g)));
                 itemsAdded += results.newSavingsGoals.length;
            }
            if (results.savingsContributions) {
                results.savingsContributions.forEach(c => promises.push(addFunds(c.goalName, c.amount)));
                 itemsAdded += results.savingsContributions.length;
            }
            await Promise.all(promises);
            toast({ title: 'Success!', description: `${itemsAdded} items have been added to your account.` });
            router.push('/dashboard');
        } catch (error) {
            console.error("Failed to save results:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save all items.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const renderTransactionItem = (item: any, key: 'incomes' | 'expenses') => {
        const categories = key === 'incomes' ? incomeCategories : expenseCategories;
        if (item.isEditing) {
            return (
                <div key={item.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <Input value={item.description} onChange={(e) => handleUpdate(key, item.id, 'description', e.target.value)} placeholder="Description" />
                    <Input value={item.amount} type="number" onChange={(e) => handleUpdate(key, item.id, 'amount', parseFloat(e.target.value) || 0)} placeholder="Amount" />
                    <Select value={item.category} onValueChange={(value) => handleUpdate(key, item.id, 'category', value)}>
                        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                            {categories.map(c => <SelectItem key={c.name} value={c.name}>{getCategoryName(c.name)}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-2">
                         <Button size="icon" variant="ghost" onClick={() => toggleEdit(key, item.id)}><Check className="h-4 w-4 text-green-500" /></Button>
                    </div>
                </div>
            );
        }
        return (
            <div key={item.id} className="flex items-center gap-2 p-3 rounded-md">
                <div className="flex-grow">
                    <p className="font-semibold">{item.description}</p>
                    <p className="text-sm text-muted-foreground">{getCategoryName(item.category)}</p>
                </div>
                <p className="font-bold">{formatCurrency(item.amount)}</p>
                <Button size="icon" variant="ghost" onClick={() => toggleEdit(key, item.id)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(key, item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

    const hasResults = Object.values(results).some(arr => arr && arr.length > 0);

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
                        <CardContent>
                            <p className="text-muted-foreground mt-2">We couldn't detect any financial actions on your document.</p>
                            <Button className="mt-4" onClick={() => router.push('/dashboard/scan-receipt')}>Try Again</Button>
                        </CardContent>
                    </Card>
                )}

                {results.expenses && results.expenses.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Expenses</CardTitle></CardHeader>
                        <CardContent className="space-y-2">{results.expenses.map(item => renderTransactionItem(item, 'expenses'))}</CardContent>
                    </Card>
                )}
                {results.incomes && results.incomes.length > 0 && (
                     <Card>
                        <CardHeader><CardTitle>Incomes</CardTitle></CardHeader>
                        <CardContent className="space-y-2">{results.incomes.map(item => renderTransactionItem(item, 'incomes'))}</CardContent>
                    </Card>
                )}
                 {/* TODO: Add editable views for budgets and savings goals */}
            </main>

            {hasResults && (
                <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t grid grid-cols-2 gap-4">
                    <Button variant="outline" size="lg" onClick={() => router.push('/dashboard/scan-receipt')}>
                        <X className="mr-2 h-4 w-4"/> Cancel & Retake
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

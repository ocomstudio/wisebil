// src/app/dashboard/scan-receipt/results/page.tsx
"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/locale-context';
import { useTransactions } from '@/context/transactions-context';
import { useBudgets } from '@/context/budget-context';
import { useSavings } from '@/context/savings-context';
import { Loader2, ArrowLeft, ScanLine, Bot, PiggyBank, Briefcase, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { scanDocument } from '@/ai/flows/scan-document-flow';
import type { ScanDocumentInput, AgentWOutput } from '@/types/ai-schemas';
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { expenseCategories, incomeCategories } from '@/config/categories';

function ScanResultsContent() {
    const router = useRouter();
    const { t, getCategoryName, formatCurrency } = useLocale();
    const { toast } = useToast();
    const { addTransaction } = useTransactions();
    const { addBudget } = useBudgets();
    const { addSavingsGoal } = useSavings();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [scanResult, setScanResult] = useState<AgentWOutput | null>(null);

    const processScan = useCallback(async (dataUri: string) => {
        try {
            const input: ScanDocumentInput = { photoDataUri: dataUri };
            const result = await scanDocument(input);
            setScanResult(result);
        } catch (error) {
            console.error("Error performing scan:", error);
            toast({ variant: 'destructive', title: t('scan_failed_title'), description: t('scan_failed_desc') });
        } finally {
            setIsLoading(false);
        }
    }, [t, toast]);

    useEffect(() => {
        const dataUri = sessionStorage.getItem('scannedImageDataUri');
        if (!dataUri) {
            toast({ variant: 'destructive', title: t('error_title'), description: 'No image data found.' });
            router.push('/dashboard');
            return;
        }
        processScan(dataUri);
    }, [router, t, toast, processScan]);

    const handleSaveAll = async () => {
        if (!scanResult) return;
        setIsSaving(true);
        let itemsAdded = 0;
        try {
            if (scanResult.transactions) {
                for (const tx of scanResult.transactions) {
                    await addTransaction({
                        id: uuidv4(),
                        type: tx.amount < 0 ? 'expense' : 'income',
                        amount: Math.abs(tx.amount),
                        description: tx.description,
                        category: tx.category,
                        date: tx.date,
                    });
                    itemsAdded++;
                }
            }
            if (scanResult.newBudgets) {
                for (const budget of scanResult.newBudgets) {
                    await addBudget({ id: uuidv4(), ...budget });
                    itemsAdded++;
                }
            }
            if (scanResult.newSavingsGoals) {
                for (const goal of scanResult.newSavingsGoals) {
                    await addSavingsGoal({ id: uuidv4(), ...goal });
                    itemsAdded++;
                }
            }

            toast({
                title: t('scan_save_success_title'),
                description: t('scan_save_success_desc', { count: itemsAdded }),
            });
            router.push('/dashboard');

        } catch (error) {
            console.error("Error saving scan results:", error);
            toast({ variant: "destructive", title: t('error_title'), description: t('scan_save_error_desc') });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleCategoryChange = (index: number, newCategory: string) => {
        if (scanResult?.transactions) {
            const updatedTransactions = [...scanResult.transactions];
            updatedTransactions[index].category = newCategory;
            setScanResult({ ...scanResult, transactions: updatedTransactions });
        }
    }

    if (isLoading) {
        return (
            <div className="p-4 bg-muted/40 min-h-screen space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    const hasResults = scanResult && (scanResult.transactions?.length || scanResult.newBudgets?.length || scanResult.newSavingsGoals?.length);

    return (
        <div className="p-4 bg-muted/40 min-h-screen">
            <header className="flex items-center gap-4 pb-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold font-headline">{t('scan_results_title')}</h1>
            </header>

            <main className="space-y-6 pb-24">
                {!hasResults ? (
                    <Card className="text-center p-8">
                        <CardHeader>
                            <div className="mx-auto bg-background p-3 rounded-full w-fit mb-2">
                                <Bot className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <CardTitle>{t('scan_no_data_title')}</CardTitle>
                            <CardDescription>{t('scan_no_data_desc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button onClick={() => router.back()}>{t('back_button')}</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {scanResult.transactions && scanResult.transactions.length > 0 && (
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5"/> {t('scan_transactions_title')}
                                    </CardTitle>
                                </CardHeader>
                                 <CardContent className="space-y-2">
                                    {scanResult.transactions.map((tx, index) => (
                                        <div key={`tx-${index}`} className="grid grid-cols-[1fr_auto] gap-2 items-center border p-2 rounded-md">
                                           <div>
                                             <p className="font-semibold">{tx.description}</p>
                                             <p className={`text-sm ${tx.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(Math.abs(tx.amount))}</p>
                                           </div>
                                            <Select value={tx.category} onValueChange={(value) => handleCategoryChange(index, value)}>
                                                <SelectTrigger className="w-[150px]">
                                                    <SelectValue placeholder={t('category_placeholder')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tx.amount < 0 ? expenseCategories.map(c => <SelectItem key={c.name} value={c.name}>{getCategoryName(c.name)}</SelectItem>) : incomeCategories.map(c => <SelectItem key={c.name} value={c.name}>{getCategoryName(c.name)}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                        {scanResult.newBudgets && scanResult.newBudgets.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5"/> Nouveaux Budgets</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                     {scanResult.newBudgets.map((b, index) => (
                                        <div key={`b-${index}`} className="border p-2 rounded-md flex justify-between items-center">
                                            <p>{b.name} ({getCategoryName(b.category)})</p>
                                            <p className="font-semibold">{formatCurrency(b.amount)}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                         {scanResult.newSavingsGoals && scanResult.newSavingsGoals.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><PiggyBank className="h-5 w-5"/> Nouveaux Objectifs</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                     {scanResult.newSavingsGoals.map((g, index) => (
                                        <div key={`g-${index}`} className="border p-2 rounded-md flex justify-between items-center">
                                            <p>{g.name}</p>
                                            <p className="font-semibold">{formatCurrency(g.targetAmount)}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        <Button onClick={handleSaveAll} disabled={isSaving} className="w-full">
                           {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           {t('scan_save_all_button')}
                        </Button>
                    </>
                )}
            </main>
        </div>
    )
}

export default function ScanResultsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ScanResultsContent />
        </Suspense>
    )
}

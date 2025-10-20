// src/app/dashboard/scan-receipt/results/page.tsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/locale-context';
import { useTransactions } from '@/context/transactions-context';
import { Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { TransactionForm } from '@/components/dashboard/transaction-form';
import type { Transaction } from '@/types/transaction';

// Mock OCR function - in a real scenario, this would use a library like Tesseract.js
const performOcr = async (dataUri: string): Promise<string> => {
    // This is a placeholder. A real implementation would process the image.
    console.log("Pretending to run OCR on an image.");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
    return `FAKE OCR RESULT:
    --------------------
    TICKET DE CAISSE
    SUPERMARCHE ABC
    
    Banane 1.50 EUR
    Pain   1.10 EUR
    Lait   0.95 EUR
    
    TOTAL: 3.55 EUR
    Date: 25/07/2024
    --------------------
    Please copy the details from this text into the form below.`;
};


function ScanResultsContent() {
    const router = useRouter();
    const { t } = useLocale();
    const { toast } = useToast();
    const { addTransaction } = useTransactions();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [imageDataUri, setImageDataUri] = useState<string | null>(null);
    const [ocrText, setOcrText] = useState('');

    useEffect(() => {
        const dataUri = sessionStorage.getItem('scannedImageDataUri');
        if (!dataUri) {
            toast({ variant: 'destructive', title: t('error_title'), description: 'No image data found.' });
            router.push('/dashboard');
            return;
        }

        setImageDataUri(dataUri);

        const processScan = async () => {
            try {
                const text = await performOcr(dataUri);
                setOcrText(text);
            } catch (error) {
                console.error("Error performing OCR:", error);
                toast({ variant: 'destructive', title: t('scan_failed_title'), description: t('scan_failed_desc') });
                setOcrText("Failed to extract text from image.");
            } finally {
                setIsLoading(false);
            }
        };

        processScan();
    }, [router, t, toast]);

    const handleSaveTransaction = async (data: Omit<Transaction, 'id' | 'type'>) => {
        setIsSaving(true);
        try {
            const newTransaction: Transaction = {
                id: new Date().toISOString(),
                type: 'expense', // Defaulting to expense as it's the most common use case
                ...data
            };
            await addTransaction(newTransaction);
            toast({
                title: t('expense_added_title'),
                description: t('expense_added_desc', { expenseDesc: data.description }),
            });
            router.push('/dashboard');
        } catch (error) {
            console.error("Failed to save transaction:", error);
            toast({ variant: "destructive", title: t('error_title'), description: t('expense_add_error_desc') });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="p-4 bg-muted/40 min-h-screen">
            <header className="flex items-center gap-4 pb-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold font-headline">{t('scan_results_title')}</h1>
            </header>

            <main className="space-y-4 pb-24">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5"/> Document Scanné</CardTitle>
                        <CardDescription>
                            Utilisez le texte extrait pour remplir le formulaire ci-dessous.
                        </CardDescription>
                    </CardHeader>
                     <CardContent>
                        {isLoading ? (
                             <div className="space-y-2">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ) : (
                            <Textarea
                                value={ocrText}
                                onChange={(e) => setOcrText(e.target.value)}
                                readOnly={isLoading}
                                className="h-48 text-sm font-mono"
                                placeholder="Texte extrait du document..."
                            />
                        )}
                    </CardContent>
                </Card>
                
                <TransactionForm
                    transactionType="expense"
                    onSubmit={handleSaveTransaction}
                    isSubmitting={isSaving}
                    submitButtonText={t('add_expense_button')}
                />
            </main>
        </div>
    )
}

export default function ScanResultsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ScanResultsContent />
        </Suspense>
    )
}

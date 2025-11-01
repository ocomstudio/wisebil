// src/app/dashboard/scan-receipt/page.tsx
"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, ArrowLeft, AlertTriangle, Paperclip, X, ScanLine, Bot, Check, Trash2, PiggyBank, Briefcase, TrendingDown, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/locale-context';
import { useTransactions } from '@/context/transactions-context';
import { useBudgets } from '@/context/budget-context';
import { useSavings } from '@/context/savings-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { scanDocument } from '@/ai/flows/scan-document-flow';
import type { ScanDocumentInput, AgentWOutput } from '@/types/ai-schemas';
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { expenseCategories, incomeCategories } from '@/config/categories';

type ScanStep = 'capturing' | 'processing' | 'reviewing';

interface ScanReceiptPageProps {
  onComplete: () => void;
}

function ScanReceiptContent({ onComplete }: ScanReceiptPageProps) {
  const router = useRouter();
  const { t, getCategoryName, formatCurrency } = useLocale();
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  const { addBudget } = useBudgets();
  const { addSavingsGoal } = useSavings();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [scanStep, setScanStep] = useState<ScanStep>('capturing');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [wakeLockRef, setWakeLockRef] = useState<WakeLockSentinel | null>(null);

  const [scanResult, setScanResult] = useState<AgentWOutput | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const acquireWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && !wakeLockRef) {
      try {
        const lock = await navigator.wakeLock.request('screen');
        setWakeLockRef(lock);
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    }
  }, [wakeLockRef]);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef) {
      wakeLockRef.release();
      setWakeLockRef(null);
    }
  }, [wakeLockRef]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        await acquireWakeLock();
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported");
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    if (scanStep === 'capturing') {
        getCameraPermission();
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      releaseWakeLock();
    };
  }, [scanStep, acquireWakeLock, releaseWakeLock]);

  const processImageAndScan = async (dataUri: string) => {
    setScanStep('processing');
    try {
      const input: ScanDocumentInput = { photoDataUri: dataUri };
      const result = await scanDocument(input);
      setScanResult(result);
      setScanStep('reviewing');
    } catch (error) {
      console.error('Error during processing:', error);
      let message = t('scan_failed_desc');
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        message = t('image_too_large_error');
      }
      toast({
        variant: 'destructive',
        title: t('scan_failed_title'),
        description: message,
      });
      setScanStep('capturing'); // Go back to capture screen
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !hasCameraPermission) {
      toast({
        variant: 'destructive',
        title: t('camera_permission_denied_title'),
        description: t('camera_permission_denied_desc'),
      });
      return;
    }
    setScanStep('processing');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const dataUri = canvas.toDataURL('image/jpeg', 0.9);
    await processImageAndScan(dataUri);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setScanStep('processing');
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        await processImageAndScan(dataUri);
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: t('file_read_error_title'),
          description: t('file_read_error_desc'),
        });
        setScanStep('capturing');
      };
      reader.readAsDataURL(file);
    }
  };
  
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
        onComplete();
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
  };

  const hasResults = scanResult && (scanResult.transactions?.length || scanResult.newBudgets?.length || scanResult.newSavingsGoals?.length);

  // Main Container
  return (
    <div className="flex flex-col h-full bg-black">
      <header className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm z-10">
        <Button variant="ghost" size="icon" onClick={scanStep === 'reviewing' ? () => setScanStep('capturing') : onComplete}>
          {scanStep === 'reviewing' ? <ArrowLeft className="h-5 w-5 text-white" /> : <X className="h-5 w-5 text-white" />}
        </Button>
        <h1 className="text-lg font-bold text-white">{scanStep === 'reviewing' ? t('scan_results_title') : t('scan_receipt_title')}</h1>
        <div className="w-10"></div>
      </header>

      {/* Conditional Content */}
      <main className="flex-1 flex flex-col relative bg-gray-900 overflow-hidden">
        {scanStep === 'capturing' && (
          <>
            <video ref={videoRef} className={`w-full h-full object-cover ${hasCameraPermission ? '' : 'hidden'}`} autoPlay playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('camera_permission_denied_title')}</AlertTitle>
                  <AlertDescription>{t('camera_permission_denied_desc')}</AlertDescription>
                </Alert>
              </div>
            )}
          </>
        )}

        {(scanStep === 'processing' || isSaving) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 space-y-4 z-20">
            <Loader2 className="h-12 w-12 text-white animate-spin" />
            <p className="text-white text-lg">{isSaving ? t('saving_button') : t('scanning_button')}...</p>
          </div>
        )}

        {scanStep === 'reviewing' && (
          <div className="bg-muted/40 h-full overflow-y-auto">
            <div className="p-4 space-y-6 pb-24">
                {!hasResults ? (
                    <Card className="text-center p-8 bg-card">
                        <CardHeader>
                            <div className="mx-auto bg-background p-3 rounded-full w-fit mb-2">
                                <Bot className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <CardTitle>{t('scan_no_data_title')}</CardTitle>
                            <CardDescription>{t('scan_no_data_desc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button onClick={() => setScanStep('capturing')}>{t('retry_button')}</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {scanResult.transactions && scanResult.transactions.length > 0 && (
                             <Card className="bg-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5"/> {t('scan_transactions_title')}
                                    </CardTitle>
                                </CardHeader>
                                 <CardContent className="space-y-2">
                                    {scanResult.transactions.map((tx, index) => (
                                        <div key={`tx-${index}`} className="grid grid-cols-[1fr_auto] gap-2 items-center border p-2 rounded-md bg-background">
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
                            <Card className="bg-card">
                                <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5"/> {t('new_budgets_title')}</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                     {scanResult.newBudgets.map((b, index) => (
                                        <div key={`b-${index}`} className="border p-2 rounded-md flex justify-between items-center bg-background">
                                            <p>{b.name} ({getCategoryName(b.category)})</p>
                                            <p className="font-semibold">{formatCurrency(b.amount)}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                         {scanResult.newSavingsGoals && scanResult.newSavingsGoals.length > 0 && (
                            <Card className="bg-card">
                                <CardHeader><CardTitle className="flex items-center gap-2"><PiggyBank className="h-5 w-5"/> {t('new_savings_goals_title')}</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                     {scanResult.newSavingsGoals.map((g, index) => (
                                        <div key={`g-${index}`} className="border p-2 rounded-md flex justify-between items-center bg-background">
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
            </div>
          </div>
        )}
      </main>

      {/* Footer is only for capturing */}
      {scanStep === 'capturing' && (
        <footer className="p-6 bg-black/50 backdrop-blur-sm flex items-center justify-around">
          <Button onClick={() => fileInputRef.current?.click()} disabled={scanStep === 'processing'} variant="ghost" className="w-20 h-20 rounded-full flex items-center justify-center text-white hover:bg-white/20" aria-label={t('upload_file_label')}>
            <Paperclip className="h-8 w-8" />
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
          <Button onClick={handleCapture} disabled={scanStep === 'processing' || hasCameraPermission !== true} className="w-20 h-20 rounded-full border-4 border-white/50 bg-white/30 hover:bg-white/50 flex items-center justify-center" aria-label={t('capture_photo_label')}>
            <Camera className="h-8 w-8 text-white" />
          </Button>
          <div className="w-20 h-20"></div>
        </footer>
      )}
    </div>
  );
}

export default function ScanReceiptPage({ onComplete }: { onComplete: () => void; }) {
    return (
        <Suspense fallback={<div className="bg-black h-screen w-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>}>
            <ScanReceiptContent onComplete={onComplete} />
        </Suspense>
    )
}

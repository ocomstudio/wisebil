// src/app/dashboard/scan-receipt/page.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/locale-context';
import { processReceipt } from '@/ai/flows/process-receipt-flow';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function ScanReceiptPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
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
        toast({
          variant: 'destructive',
          title: t('camera_permission_denied_title'),
          description: t('camera_permission_denied_desc'),
        });
      }
    };

    getCameraPermission();

    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast, t]);

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const dataUri = canvas.toDataURL('image/jpeg');

    try {
      const result = await processReceipt({ photoDataUri: dataUri });
      
      const queryParams = new URLSearchParams({
        amount: result.amount.toString(),
        description: result.merchantName,
        date: result.date,
        category: result.category,
      });

      router.push(`/dashboard/add-expense?${queryParams.toString()}`);

    } catch (error) {
      console.error('Error processing receipt:', error);
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: 'Could not extract information from the receipt. Please try again.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
       <header className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm z-10">
         <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
         </Button>
         <h1 className="text-lg font-bold text-white">{t('scan_receipt_title')}</h1>
         <div className="w-10"></div>
       </header>

       <main className="flex-1 flex flex-col items-center justify-center relative">
         <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
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
       </main>

       <footer className="p-6 bg-black/50 backdrop-blur-sm">
         <Button onClick={handleScan} disabled={isScanning || hasCameraPermission === false} className="w-full h-16 rounded-full text-lg">
           {isScanning ? (
             <Loader2 className="h-6 w-6 animate-spin" />
           ) : (
             <Camera className="h-6 w-6 mr-2" />
           )}
           {isScanning ? t('scanning_button') : t('scan_button')}
         </Button>
       </footer>
    </div>
  );
}

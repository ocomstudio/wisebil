// src/app/dashboard/scan-receipt/page.tsx
"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, ArrowLeft, AlertTriangle, Paperclip, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/locale-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

interface ScanReceiptPageProps {
  onComplete: () => void;
}

function ScanReceiptContent({ onComplete }: ScanReceiptPageProps) {
  const router = useRouter();
  const { t } = useLocale();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const acquireWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
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

    getCameraPermission();

    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        releaseWakeLock();
    }
  }, [acquireWakeLock, releaseWakeLock]);
  
  const processImageAndNavigate = (dataUri: string) => {
    try {
      sessionStorage.setItem('scannedImageDataUri', dataUri);
      onComplete(); // Close the modal
      router.push('/dashboard/scan-receipt/results');
    } catch (error) {
       console.error('Error during processing:', error);
       let message = t('processing_failed_desc');
       if (error instanceof DOMException && error.name === 'QuotaExceededError') {
           message = t('image_too_large_error');
       }
       toast({
        variant: 'destructive',
        title: t('processing_failed_title'),
        description: message,
      });
      setIsProcessing(false);
    }
  }

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !hasCameraPermission) {
       toast({
        variant: 'destructive',
        title: t('camera_permission_denied_title'),
        description: t('camera_permission_denied_desc'),
      });
      return;
    };
    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const dataUri = canvas.toDataURL('image/jpeg', 0.9);
    processImageAndNavigate(dataUri);
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        processImageAndNavigate(dataUri);
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: t('file_read_error_title'),
          description: t('file_read_error_desc'),
        });
        setIsProcessing(false);
      }
      reader.readAsDataURL(file);
    }
  }
  
  const handleUploadClick = () => {
      fileInputRef.current?.click();
  }

  return (
    <div className="flex flex-col h-full bg-black">
       <header className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm z-10">
         <Button variant="ghost" size="icon" onClick={onComplete}>
            <X className="h-5 w-5 text-white" />
         </Button>
         <h1 className="text-lg font-bold text-white">{t('scan_receipt_title')}</h1>
         <div className="w-10"></div>
       </header>

       <main className="flex-1 flex flex-col items-center justify-center relative bg-gray-900">
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
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 space-y-4">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
              <p className="text-white text-lg">{t('scanning_button')}...</p>
            </div>
          )}
       </main>

       <footer className="p-6 bg-black/50 backdrop-blur-sm flex items-center justify-around">
         <Button 
            onClick={handleUploadClick} 
            disabled={isProcessing} 
            variant="ghost"
            className="w-20 h-20 rounded-full flex items-center justify-center text-white hover:bg-white/20"
            aria-label={t('upload_file_label')}
          >
           <Paperclip className="h-8 w-8" />
         </Button>
         <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
         
         <Button 
            onClick={handleCapture} 
            disabled={isProcessing || hasCameraPermission !== true} 
            className="w-20 h-20 rounded-full border-4 border-white/50 bg-white/30 hover:bg-white/50 flex items-center justify-center"
            aria-label={t('capture_photo_label')}
          >
           <Camera className="h-8 w-8 text-white" />
         </Button>

         <div className="w-20 h-20"></div>
       </footer>
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

"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InstallPWA() {
  const isMobile = useIsMobile();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined' && !isMobile) {
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin)}`);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isMobile]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };
  
  if (!isClient) return null;

  if (isMobile) {
    if (!deferredPrompt) return null;
    return (
      <Button onClick={handleInstallClick} className="w-full" variant="default" size="lg">
        <Download className="mr-2 h-4 w-4" />
        Install App
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download App
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download on your phone</DialogTitle>
          <DialogDescription>
            Scan this QR code with your mobile device to open Wisebil and install it on your home screen.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4 bg-white rounded-md">
          {qrCodeUrl ? (
             <Image src={qrCodeUrl} width={200} height={200} alt="QR Code for mobile installation" />
          ) : (
            <div className="w-[200px] h-[200px] bg-gray-200 animate-pulse rounded-md" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

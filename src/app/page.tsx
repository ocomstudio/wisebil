// src/app/page.tsx
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import DesktopLandingPage from "@/components/landing/desktop-landing-page";
import MobileLandingPage from "@/components/landing/mobile-landing-page";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (isMobile === undefined) {
    return (
       <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  return isMobile ? <MobileLandingPage /> : <DesktopLandingPage />;
}

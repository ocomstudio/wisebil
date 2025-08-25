// src/app/page.tsx
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import DesktopLandingPage from "@/components/landing/desktop-landing-page";
import MobileLandingPage from "@/components/landing/mobile-landing-page";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from "@/components/common/protected-route";
import { AuthProvider } from "@/context/auth-context";

function LandingPage() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isMobile = useIsMobile();

  if (!isClient) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return isMobile ? <MobileLandingPage /> : <DesktopLandingPage />;
}


export default function Home() {
    return (
        <AuthProvider>
            <ProtectedRoute>
                <LandingPage />
            </ProtectedRoute>
        </AuthProvider>
    )
}

// src/components/dashboard/entreprise/enterprise-drawer.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import EnterprisePage from "@/app/dashboard/entreprise/page";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from 'next/navigation';

export function EnterpriseDrawer() {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const isEnterprisePage = pathname.startsWith('/dashboard/entreprise');
  const isDashboardHome = pathname === '/dashboard';

  const handleClose = () => {
    router.push('/dashboard');
  };

  if (isEnterprisePage) {
    return (
      <div className="fixed inset-0 z-[60] bg-background flex flex-col">
        <header className="p-4 flex items-center justify-between border-b flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={handleClose} className="cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-bold text-lg">{t('nav_enterprise')}</h2>
          <div className="w-10"></div>
        </header>
        <ScrollArea className="flex-1">
            {/* The content of the specific enterprise page will be rendered by Next.js router */}
        </ScrollArea>
      </div>
    );
  }

  if (isDashboardHome) {
      return (
        <div className="sticky -top-4 -mx-4 z-30 mb-2" onClick={() => router.push('/dashboard/entreprise')}>
            <div className="p-2 pt-6 text-center text-xs text-muted-foreground bg-gradient-to-b from-background to-transparent cursor-pointer">
                <ChevronDown className="h-5 w-5 mx-auto animate-bounce opacity-70" />
                <p className="font-semibold">{t('open_enterprise_space')}</p>
            </div>
        </div>
      );
  }

  return null;
}

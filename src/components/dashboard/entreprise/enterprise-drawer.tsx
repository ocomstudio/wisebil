// src/components/dashboard/entreprise/enterprise-drawer.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation, useMotionValue, PanInfo } from "framer-motion";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from 'next/navigation';

export function EnterpriseDrawer({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const isEnterprisePage = pathname.startsWith('/dashboard/entreprise');
  const isDashboardHome = pathname === '/dashboard';

  const controls = useAnimation();
  const y = useMotionValue(0);

  useEffect(() => {
    if (isEnterprisePage) {
      controls.start({ y: 0 });
    } else {
      controls.start({ y: "-100%" });
    }
  }, [isEnterprisePage, controls]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > window.innerHeight * 0.3) {
      router.push('/dashboard/entreprise');
    } else {
      controls.start({ y: "-100%" });
    }
  };
  
  const handleClose = () => {
    router.push('/dashboard');
  };

  if (!isDashboardHome && !isEnterprisePage) {
    return <div className="max-w-6xl mx-auto h-full">{children}</div>;
  }

  return (
    <>
      {isDashboardHome && (
        <>
          <div className="sticky -top-4 -mx-4 z-30 mb-2" onClick={() => router.push('/dashboard/entreprise')}>
              <div className="p-2 pt-6 text-center text-xs text-muted-foreground bg-gradient-to-b from-background to-transparent cursor-pointer">
                  <ChevronDown className="h-5 w-5 mx-auto animate-bounce opacity-70" />
                  <p className="font-semibold">{t('open_enterprise_space')}</p>
              </div>
          </div>
          <div className="max-w-6xl mx-auto h-full">{children}</div>
        </>
      )}

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        style={{ y }}
        className={cn(
          "fixed inset-x-0 top-0 h-screen bg-background/80 backdrop-blur-sm flex flex-col",
          isEnterprisePage ? 'z-[60]' : '-z-10' // High z-index only when it's supposed to be visible
        )}
      >
        <header className="p-4 flex items-center justify-between border-b flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={handleClose} className="cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-bold text-lg">{t('nav_enterprise')}</h2>
          <div className="w-10"></div>
        </header>
        <ScrollArea className="flex-1">
          <div className="p-4">
            {isEnterprisePage && children}
          </div>
        </ScrollArea>
      </motion.div>
    </>
  );
}

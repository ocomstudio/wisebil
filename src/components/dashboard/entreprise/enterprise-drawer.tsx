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
  
  const drawerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (isEnterprisePage) {
      controls.start({ y: 0 }, { duration: 0.3 });
    } else if (isDashboardHome) {
      controls.start({ y: "-100%" }, { duration: 0.3 });
    }
  }, [isEnterprisePage, isDashboardHome, controls]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // This function is for pulling down from the home screen
    if (info.velocity.y > 500 || info.offset.y > window.innerHeight * 0.3) {
      router.push('/dashboard/entreprise');
    } else {
      controls.start({ y: "-100%" });
    }
  };
  
  const handleClose = () => {
    router.push('/dashboard');
  };
  
  // Render children directly if not on mobile dashboard or enterprise pages.
  if (!isDashboardHome && !isEnterprisePage) {
    return <div className="max-w-6xl mx-auto h-full">{children}</div>;
  }
  
  return (
    <>
      {isDashboardHome && (
        <>
          <motion.div 
            className="sticky -top-4 -mx-4 z-30 mb-2"
            drag="y"
            dragConstraints={{ top: -100, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.8 }}
            onDragEnd={handleDragEnd}
            >
              <div className="p-2 pt-6 text-center text-xs text-muted-foreground bg-gradient-to-b from-background to-transparent cursor-grab">
                  <ChevronDown className="h-5 w-5 mx-auto opacity-70" />
                  <p className="font-semibold">{t('open_enterprise_space')}</p>
              </div>
          </motion.div>
          <div className="max-w-6xl mx-auto h-full">{children}</div>
        </>
      )}

      <motion.div
        ref={drawerRef}
        animate={controls}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        style={{ y }}
        className={cn(
          "fixed inset-x-0 top-0 h-[100dvh] bg-background flex flex-col",
          isEnterprisePage ? 'z-[60]' : 'z-20'
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

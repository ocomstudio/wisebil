// src/components/dashboard/entreprise/enterprise-drawer.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation, useMotionValue, PanInfo } from "framer-motion";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { useLocale } from "@/context/locale-context";
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
    if (info.velocity.y > 200 || info.offset.y > window.innerHeight * 0.3) {
      controls.start({ y: 0 });
      router.push('/dashboard/entreprise');
    } else {
      controls.start({ y: "-100%" });
    }
  };
  
  const handleClose = () => {
    router.push('/dashboard');
  };

  const showPuller = isDashboardHome;

  return (
    <>
      <div className={cn("relative", !isEnterprisePage && "h-full")}>
        {children}
      </div>

      <motion.div
        drag={isEnterprisePage ? false : "y"}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.2, bottom: 0.2 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        transition={{ type: "spring", damping: 40, stiffness: 400 }}
        style={{ y, top: '-100%', bottom: 'auto' }}
        className={cn(
          "fixed inset-x-0 h-screen bg-background/95 backdrop-blur-sm flex flex-col z-[60]"
        )}
      >
        <header className="p-4 flex items-center justify-between border-b flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={handleClose} className="cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-bold text-lg">{t('nav_enterprise')}</h2>
          <div className="w-10"></div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {isEnterprisePage && children}
          </div>
        </div>
      </motion.div>
    </>
  );
}

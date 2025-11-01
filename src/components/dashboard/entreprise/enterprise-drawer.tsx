// src/components/dashboard/entreprise/enterprise-drawer.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation, useMotionValue, PanInfo } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from 'next/navigation';

export function EnterpriseDrawer({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const isEnterprisePage = pathname.startsWith('/dashboard/entreprise');
  
  const controls = useAnimation();
  const y = useMotionValue(0);

  useEffect(() => {
    if (isEnterprisePage) {
      controls.start({ y: 0 });
    } else {
      controls.start({ y: "-100%" });
    }
  }, [isEnterprisePage, controls]);

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <div className={cn("relative", isEnterprisePage && "hidden")}>
          {children}
      </div>

      <motion.div
        animate={controls}
        transition={{ type: "spring", damping: 30, stiffness: 250 }}
        style={{ y }}
        className={cn(
          "fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col z-[60] md:hidden",
          !isEnterprisePage && "pointer-events-none"
        )}
      >
        <header className="p-4 flex items-center justify-between border-b flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={handleClose} className="cursor-pointer">
            <ArrowDown className="h-5 w-5" />
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

// src/components/dashboard/entreprise/enterprise-drawer.tsx
"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from 'next/navigation';
import { useIsMobile } from "@/hooks/use-mobile";

export function EnterpriseDrawer({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const isEnterprisePage = pathname.startsWith('/dashboard/entreprise');
  
  const controls = useAnimation();

  useEffect(() => {
    if (isMobile && isEnterprisePage) {
      controls.start({ y: 0 });
    } else {
      controls.start({ y: "100%" });
    }
  }, [isEnterprisePage, controls, isMobile]);

  const handleClose = () => {
    router.push('/dashboard');
  };
  
  if (!isMobile) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={controls}
      transition={{ type: "spring", damping: 30, stiffness: 250 }}
      className={cn(
        "fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col z-[60] md:hidden",
        !isEnterprisePage && "pointer-events-none"
      )}
    >
      <header className="p-4 flex items-center justify-between border-b flex-shrink-0">
        <Button variant="ghost" onClick={handleClose} className="cursor-pointer">
          <ArrowDown className="mr-2 h-5 w-5" />
          {t('back_to_dashboard')}
        </Button>
        <h2 className="font-bold text-lg">{t('nav_enterprise')}</h2>
        <div className="w-24"></div> {/* Spacer */}
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

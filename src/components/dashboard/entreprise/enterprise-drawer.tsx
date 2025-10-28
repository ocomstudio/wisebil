// src/components/dashboard/entreprise/enterprise-drawer.tsx
"use client";

import { useState } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { Building, ChevronDown, ArrowLeft } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import EnterprisePage from "@/app/dashboard/entreprise/page";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EnterpriseDrawer() {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const controls = useAnimation();

  const handleOpen = () => {
    setIsOpen(true);
    controls.start({ y: 0 });
  };

  const handleClose = () => {
    setIsOpen(false);
    controls.start({ y: "100%" });
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 0) {
      controls.set({ y: info.offset.y });
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) {
      handleClose();
    } else {
      controls.start({ y: 0 });
    }
  };

  return (
    <>
      {/* Drawer content */}
      <motion.div
        className="fixed top-0 left-0 h-full w-full z-40 bg-background flex flex-col"
        initial={{ y: "100%" }}
        animate={controls}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
      >
        <header 
          className="p-4 flex items-center justify-between border-b flex-shrink-0 cursor-grab touch-none"
          onPanStart={handleDrag}
          onPan={handleDrag}
          onPanEnd={handleDragEnd}
        >
           <Button variant="ghost" size="icon" onClick={handleClose} className="cursor-pointer">
             <ArrowLeft className="h-5 w-5" />
           </Button>
           <h2 className="font-bold text-lg">{t('nav_enterprise')}</h2>
           <div className="w-10"></div>
        </header>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <EnterprisePage />
          </div>
        </ScrollArea>
      </motion.div>

      {/* Handle / Trigger */}
      <div 
        className={cn(
          "sticky -top-4 -mx-4 z-30 mb-2 cursor-pointer transition-opacity",
          isOpen && 'opacity-0 pointer-events-none'
        )}
        onClick={handleOpen}
      >
          <div className="p-2 pt-6 text-center text-xs text-muted-foreground bg-gradient-to-b from-background to-transparent">
            <ChevronDown className="h-5 w-5 mx-auto animate-bounce opacity-70" />
            <p className="font-semibold">{t('open_enterprise_space')}</p>
          </div>
      </div>
    </>
  );
}

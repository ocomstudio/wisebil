// src/components/dashboard/entreprise/enterprise-drawer.tsx
"use client";

import { useState } from "react";
import { motion, useMotionValue, useAnimation } from "framer-motion";
import { Building, ChevronDown, ArrowLeft } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import EnterprisePage from "@/app/dashboard/entreprise/page";
import { Button } from "@/components/ui/button";

export function EnterpriseDrawer() {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const y = useMotionValue(0);
  const controls = useAnimation();

  const handleDragEnd = (event: any, info: any) => {
    const dragThreshold = 50; // Threshold to open/close
    if (info.offset.y > dragThreshold) {
      // Dragged down
      setIsOpen(true);
      controls.start({ y: "100vh" });
    } else if (info.offset.y < -dragThreshold) {
      // Dragged up
      setIsOpen(false);
      controls.start({ y: 0 });
    } else {
      // Didn't pass threshold, snap back
      controls.start({ y: isOpen ? "100vh" : 0 });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    controls.start({ y: 0 });
  };

  return (
    <>
      {/* Drawer content */}
      <motion.div
        className="fixed inset-0 z-40 bg-background flex flex-col"
        initial={{ y: "-100vh" }}
        animate={controls}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ y }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        <header className="p-4 flex items-center justify-between border-b flex-shrink-0">
           <Button variant="ghost" size="icon" onClick={handleClose}>
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
      {!isOpen && (
        <motion.div
          className="sticky -top-4 -mx-4 z-30 mb-2 cursor-grab"
          whileTap={{ cursor: "grabbing" }}
        >
          <div className="p-2 pt-6 text-center text-xs text-muted-foreground bg-gradient-to-b from-background to-transparent">
            <ChevronDown className="h-5 w-5 mx-auto animate-bounce opacity-70" />
            <p className="font-semibold">{t('open_enterprise_space')}</p>
          </div>
        </motion.div>
      )}
    </>
  );
}

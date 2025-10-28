// src/components/dashboard/entreprise/enterprise-drawer.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation, PanInfo, useDragControls } from "framer-motion";
import { Building, ChevronDown, ArrowLeft } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import EnterprisePage from "@/app/dashboard/entreprise/page";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EnterpriseDrawer() {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const animationControls = useAnimation();
  const dragControls = useDragControls();
  const drawerRef = useRef<HTMLDivElement>(null);
  
  const openDrawer = () => {
    animationControls.start({ y: 0 });
    setIsOpen(true);
  };
  
  const closeDrawer = () => {
    animationControls.start({ y: "-100%" });
    setIsOpen(false);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Velocity check to close on a fast swipe up
    if (info.velocity.y > 500) {
      closeDrawer();
      return;
    }
    // Position check to snap open or closed
    if (drawerRef.current && info.point.y > drawerRef.current.clientHeight / 2) {
      openDrawer();
    } else {
      closeDrawer();
    }
  };
  
  function startDrag(event: React.PointerEvent) {
    dragControls.start(event, { snapToCursor: false })
  }

  return (
    <>
      {/* Drawer content */}
      <motion.div
        ref={drawerRef}
        className="fixed top-0 left-0 h-screen w-screen z-[60] bg-background/80 backdrop-blur-sm flex flex-col"
        initial={{ y: "-100%" }}
        animate={animationControls}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        drag="y"
        dragControls={dragControls}
        onDragEnd={handleDragEnd}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.1 }}
      >
        <header 
          className="p-4 flex items-center justify-between border-b flex-shrink-0"
        >
           <Button variant="ghost" size="icon" onClick={closeDrawer} className="cursor-pointer">
             <ChevronDown className="h-5 w-5" />
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
        onPointerDown={startDrag}
        className={cn(
          "sticky -top-4 -mx-4 z-30 mb-2 cursor-grab touch-none transition-opacity",
          isOpen && 'opacity-0 pointer-events-none'
        )}
      >
          <div className="p-2 pt-6 text-center text-xs text-muted-foreground bg-gradient-to-b from-background to-transparent">
            <ChevronDown className="h-5 w-5 mx-auto animate-bounce opacity-70" />
            <p className="font-semibold">{t('open_enterprise_space')}</p>
          </div>
      </div>
    </>
  );
}

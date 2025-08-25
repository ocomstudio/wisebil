// src/components/common/tutorial-step.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocale } from "@/context/locale-context";

interface Step {
  id: string;
  titleKey: string;
  contentKey: string;
  targetId: string;
}

const tutorialStepKeys: Step[] = [
  {
    id: "step1",
    titleKey: "tutorial_step1_title",
    contentKey: "tutorial_step1_content",
    targetId: "balance-card-tutorial",
  },
  {
    id: "step2",
    titleKey: "tutorial_step2_title",
    contentKey: "tutorial_step2_content",
    targetId: "balance-card-tutorial",
  },
  {
    id: "step3",
    titleKey: "tutorial_step3_title",
    contentKey: "tutorial_step3_content",
    targetId: "add-transaction-tutorial",
  },
  {
    id: "step4",
    titleKey: "tutorial_step4_title",
    contentKey: "tutorial_step4_content",
    targetId: "recent-transactions-tutorial",
  },
  {
    id: "step5",
    titleKey: "tutorial_step5_title",
    contentKey: "tutorial_step5_content",
    targetId: "conseil-panel-tutorial",
  },
    {
    id: "step6",
    titleKey: "tutorial_step6_title",
    contentKey: "tutorial_step6_content",
    targetId: "bottom-nav-tutorial",
  }
];

interface TutorialProps {
  isOpen: boolean;
  onFinish: () => void;
}

export function Tutorial({ isOpen, onFinish }: TutorialProps) {
  const { t } = useLocale();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const isMobile = useIsMobile();
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const steps = tutorialStepKeys.filter(s => (isMobile ? s.targetId !== 'conseil-panel-tutorial' : s.targetId !== 'bottom-nav-tutorial'));
  const step = steps[currentStep];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    if (!step) return;
    
    // Skip irrelevant steps based on device
    if ((isMobile && step.targetId === 'conseil-panel-tutorial') || (!isMobile && step.targetId === 'bottom-nav-tutorial')) {
      handleNext();
      return;
    }
    
    const element = document.getElementById(step.targetId);
    setTargetElement(element);

    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    if (overlayRef.current && element) {
        const rect = element.getBoundingClientRect();
        overlayRef.current.style.setProperty('--highlight-top', `${rect.top}px`);
        overlayRef.current.style.setProperty('--highlight-left', `${rect.left}px`);
        overlayRef.current.style.setProperty('--highlight-width', `${rect.width}px`);
        overlayRef.current.style.setProperty('--highlight-height', `${rect.height}px`);
    }

  }, [currentStep, isOpen, isMobile, step]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };
  
  const handlePrevious = () => {
       if (currentStep > 0) {
           setCurrentStep(currentStep - 1);
       }
  }

  if (!isOpen || !step) {
    return null;
  }
  
  return (
    <>
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[99] pointer-events-none"
        style={{
            background: `radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.7) 100%)`,
            clipPath: `evenodd`,
            WebkitMask: `
                radial-gradient(
                    circle at calc(var(--highlight-left, 0px) + var(--highlight-width, 0px) / 2) calc(var(--highlight-top, 0px) + var(--highlight-height, 0px) / 2),
                    transparent 0,
                    transparent calc(max(var(--highlight-width, 0px), var(--highlight-height, 0px)) / 1.5),
                    black calc(max(var(--highlight-width, 0px), var(--highlight-height, 0px)) / 1.5 + 50px),
                    black 100%
                ),
                linear-gradient(white, white)
            `,
            WebkitMaskComposite: 'destination-out',
            maskComposite: 'exclude',
        }}
      ></div>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onFinish()}>
        <DialogContent 
            className="z-[100] max-w-sm bg-background/80 backdrop-blur-sm border-0"
            onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="font-headline">{t(step.titleKey)}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">{t(step.contentKey)}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-between items-center pt-4">
            <span className="text-sm text-muted-foreground">{currentStep + 1} / {steps.length}</span>
            <div className="flex gap-2">
                {currentStep > 0 && <Button variant="ghost" onClick={handlePrevious}>{t('previous_button')}</Button>}
                <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? t('finish_button') : t('next_button')}
                </Button>
            </div>
          </div>
        </DialogContent>
    </Dialog>
    </>
  );
}

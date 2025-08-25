// src/components/common/tutorial-step.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface Step {
  id: string;
  title: string;
  content: string;
  targetId: string;
  side?: "top" | "bottom" | "left" | "right";
}

export const TutorialSteps: Step[] = [
  {
    id: "step1",
    title: "Bienvenue sur Wisebil !",
    content: "Suivez ce guide rapide pour découvrir les fonctionnalités clés de votre tableau de bord.",
    targetId: "balance-card-tutorial",
    side: "bottom",
  },
  {
    id: "step2",
    title: "Votre Solde en un clin d'œil",
    content: "Ici, vous voyez votre solde total, ainsi que le total de vos revenus et de vos dépenses pour la période en cours.",
    targetId: "balance-card-tutorial",
    side: "bottom",
  },
  {
    id: "step3",
    title: "Ajoutez vos Transactions",
    content: "Utilisez ces boutons pour enregistrer rapidement une nouvelle dépense ou un nouveau revenu.",
    targetId: "add-transaction-tutorial",
    side: "bottom",
  },
  {
    id: "step4",
    title: "Transactions Récentes",
    content: "Vos dernières opérations apparaissent ici. Vous pouvez les modifier ou les supprimer à tout moment.",
    targetId: "recent-transactions-tutorial",
    side: "top",
  },
  {
    id: "step5",
    title: "Votre Assistant IA",
    content: "Sur ordinateur, votre assistant personnel se trouve ici. Posez-lui des questions sur vos finances ou dictez-lui vos transactions avec l'Agent W.",
    targetId: "conseil-panel-tutorial",
    side: "left"
  },
    {
    id: "step6",
    title: "Navigation Principale",
    content: "Sur mobile, utilisez cette barre pour naviguer entre les différentes sections : rapports, budgets, épargne et plus encore.",
    targetId: "bottom-nav-tutorial",
    side: "top"
  }
];

interface TutorialProps {
  steps: Step[];
  isOpen: boolean;
  onFinish: () => void;
}

export function Tutorial({ steps, isOpen, onFinish }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const isMobile = useIsMobile();

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

  const step = steps[currentStep];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    };
    
    // Skip irrelevant steps based on device
    if ((isMobile && step.targetId === 'conseil-panel-tutorial') || (!isMobile && step.targetId === 'bottom-nav-tutorial')) {
      handleNext();
      return;
    }
    
    // This effect ensures we only try to render the popover when the target is in the DOM
    const element = document.getElementById(step.targetId);
    setTargetElement(element);

  }, [currentStep, isOpen, isMobile, step.targetId]);


  if (!isOpen || !step || !targetElement) {
    return null;
  }
  
  return (
    <Popover open={true}>
      <PopoverTrigger asChild>
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          style={{
            clipPath: `path('${getHighlightPath(targetElement)}')`
          }}
        ></div>
      </PopoverTrigger>
       <PopoverContent
        side={step.side}
        align="center"
        className="z-50 max-w-sm"
        style={getPopoverPosition(targetElement)}
      >
        <div className="space-y-4">
          <h3 className="font-bold font-headline">{step.title}</h3>
          <p className="text-sm text-muted-foreground">{step.content}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{currentStep + 1} / {steps.filter(s => (isMobile ? s.targetId !== 'conseil-panel-tutorial' : s.targetId !== 'bottom-nav-tutorial')).length}</span>
            <div className="flex gap-2">
                {currentStep > 0 && <Button variant="ghost" onClick={handlePrevious}>Précédent</Button>}
                <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? "Terminer" : "Suivant"}
                </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


function getHighlightPath(element: HTMLElement) {
  const { top, left, width, height } = element.getBoundingClientRect();
  const padding = 10;
  return `
    M-1,-1 L-1,${window.innerHeight + 1} L${window.innerWidth + 1},${window.innerHeight + 1} L${window.innerWidth + 1},-1 L-1,-1 Z
    M${left - padding},${top - padding} h${width + 2 * padding} v${height + 2 * padding} h-${width + 2 * padding} Z
  `;
}


function getPopoverPosition(element: HTMLElement): React.CSSProperties {
  const { top, left, width, height } = element.getBoundingClientRect();
  
  // This positions the popover relative to the viewport, not the element, which is what we need for fixed positioning
  return {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    // We don't set width/height as PopoverContent handles it.
    // The side prop will handle the exact placement relative to these coordinates.
  };
}

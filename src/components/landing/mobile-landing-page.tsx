
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Bot, BarChart2, Wallet, PartyPopper } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/common/logo';
import { InstallPWA } from '@/components/pwa/install-pwa';

const onboardingSteps = [
  {
    icon: <Wallet className="h-16 w-16 text-primary" />,
    title: "Bienvenue sur Wisebil!",
    description: "La façon intelligente de gérer vos finances personnelles. Faisons un tour rapide.",
    image: {
      src: "https://placehold.co/600x400.png",
      dataAiHint: "welcome finance"
    }
  },
  {
    icon: <Bot className="h-16 w-16 text-primary" />,
    title: "Catégorisation par IA",
    description: "Entrez simplement la description de votre dépense, et notre IA la catégorisera intelligemment pour vous.",
    image: {
      src: "https://placehold.co/600x400.png",
      dataAiHint: "robot technology"
    }
  },
  {
    icon: <BarChart2 className="h-16 w-16 text-primary" />,
    title: "Suivez vos dépenses",
    description: "Obtenez une vue claire de la destination de votre argent grâce à notre tableau de bord et nos rapports intuitifs.",
    image: {
      src: "https://placehold.co/600x400.png",
      dataAiHint: "analytics chart"
    }
  },
  {
    icon: <PartyPopper className="h-16 w-16 text-primary" />,
    title: "Vous êtes prêt !",
    description: "Prêt à prendre le contrôle de vos finances ? Créez un compte ou connectez-vous pour commencer.",
    isFinal: false, // Changed from true
  }
];

export default function MobileLandingPage() {
  return (
    <div className="flex flex-col h-screen w-screen bg-background p-4">
      <header className="flex justify-start">
        <Logo />
      </header>
      <div className="flex-1 flex flex-col items-center justify-center">
        <Carousel className="w-full max-w-sm">
          <CarouselContent>
            {onboardingSteps.map((step, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center aspect-square">
                      <div className="mb-6">{step.icon}</div>
                      <h3 className="text-2xl font-bold mb-2 font-headline">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <footer className="py-4 space-y-4">
        <div className="w-full space-y-2">
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard">Acheter une dépense</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/dashboard">S'inscrire / Se connecter</Link>
          </Button>
        </div>
        <InstallPWA />
      </footer>
    </div>
  );
}

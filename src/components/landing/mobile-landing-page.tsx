
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
    title: "Welcome to Wisebil!",
    description: "The smart way to manage your personal finances. Let's take a quick tour.",
    image: {
      src: "https://placehold.co/600x400.png",
      dataAiHint: "welcome finance"
    }
  },
  {
    icon: <Bot className="h-16 w-16 text-primary" />,
    title: "AI-Powered Categorization",
    description: "Simply enter your expense description, and our AI will intelligently categorize it for you.",
    image: {
      src: "https://placehold.co/600x400.png",
      dataAiHint: "robot technology"
    }
  },
  {
    icon: <BarChart2 className="h-16 w-16 text-primary" />,
    title: "Track Your Spending",
    description: "Get a clear view of where your money is going with our intuitive dashboard and reports.",
    image: {
      src: "https://placehold.co/600x400.png",
      dataAiHint: "analytics chart"
    }
  },
  {
    icon: <PartyPopper className="h-16 w-16 text-primary" />,
    title: "You're All Set!",
    description: "Ready to take control of your finances? Sign up or log in to get started.",
    isFinal: false,
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
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
        <InstallPWA />
      </footer>
    </div>
  );
}

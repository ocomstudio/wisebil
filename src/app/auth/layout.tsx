// src/app/auth/layout.tsx
"use client";

import { Logo } from "@/components/common/logo";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthProvider } from "@/context/auth-context";
import { ArrowLeft } from "lucide-react";
import { LocaleProvider, useLocale } from "@/context/locale-context";
import { LanguageSelector } from "@/components/common/language-selector";


function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="relative flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="absolute top-8 left-8">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back_to_home')}
            </Link>
          </Button>
        </div>

        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <Logo />
            <LanguageSelector />
          </div>
          {children}
        </div>
      </div>
      <div className="hidden lg:flex flex-col items-center justify-center bg-secondary/30 p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent z-0"></div>
        <div className="z-10 relative">
          <Image
            src="https://images.unsplash.com/photo-1531987428847-95ad50737a07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNnx8cHJlbmV6JTIwbGUlMjBjb250cm9sZSUyMGRlJTIwdm9zJTIwZmluYW5jZXxlbnwwfHx8fDE3NTQ5OTQ2NTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
            width={500}
            height={500}
            alt="Wisebil illustration"
            data-ai-hint="happy man finance"
            className="rounded-2xl shadow-2xl mb-8 transform-gpu transition-transform hover:scale-105"
          />
          <h2 className="text-3xl font-bold font-headline mb-4">
            {t('auth_promo_title')}
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {t('auth_promo_description')}
          </p>
        </div>
      </div>
    </div>
  );
}


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <LocaleProvider>
        <AuthLayoutContent>{children}</AuthLayoutContent>
      </LocaleProvider>
    </AuthProvider>
  );
}

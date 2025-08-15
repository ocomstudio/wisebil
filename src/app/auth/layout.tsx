// src/app/auth/layout.tsx
"use client";

import { useState } from 'react';
import { AuthProvider } from "@/context/auth-context";
import { LocaleProvider } from "@/context/locale-context";
import { Logo } from '@/components/common/logo';
import { Card, CardContent } from '@/components/ui/card';
import LoginPage from './login/page';
import SignupPage from './signup/page';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoginView, setIsLoginView] = useState(true);

  const switchToSignup = () => setIsLoginView(false);
  const switchToLogin = () => setIsLoginView(true);

  return (
    <AuthProvider>
      <LocaleProvider>
        <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
               {isLoginView ? <LoginPage onSwitchToSignup={switchToSignup} /> : <SignupPage onSwitchToLogin={switchToLogin}/>}
            </div>
          </div>
          <div className="hidden bg-muted lg:block">
            <Image
              src="https://images.unsplash.com/photo-1571939831265-d710665a1ea0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxOHx8UHJlbmV6JTIwbGUlMjBjb250ciVDMyVCNGxlfGVufDB8fHx8MTc1NDk5NDkyMHww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Happy person managing finances"
              data-ai-hint="happy person finance"
              width="1920"
              height="1080"
              className="h-full w-full object-cover dark:brightness-[0.3]"
            />
          </div>
        </div>
      </LocaleProvider>
    </AuthProvider>
  );
}
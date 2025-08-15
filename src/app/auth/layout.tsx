// src/app/auth/layout.tsx
"use client";

import { AuthProvider } from "@/context/auth-context";
import { LocaleProvider, useLocale } from "@/context/locale-context";


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <LocaleProvider>
        {children}
      </LocaleProvider>
    </AuthProvider>
  );
}

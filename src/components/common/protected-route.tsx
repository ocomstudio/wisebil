// src/components/common/protected-route.tsx
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, firebaseUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!firebaseUser) {
      router.push('/auth/login');
      return;
    }

    // If user is on a page that is not the verify-email page and their email is not verified, redirect them.
    if (!firebaseUser.emailVerified && pathname !== '/auth/verify-email') {
      router.push('/auth/verify-email');
      return;
    }

    // If user is on verify-email page but their email is verified, redirect them to the dashboard.
    if (firebaseUser.emailVerified && pathname === '/auth/verify-email') {
      router.push('/dashboard');
      return;
    }

  }, [firebaseUser, isLoading, router, pathname]);

  if (isLoading || !firebaseUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  // If email is not verified, we show nothing while redirecting
  if (!firebaseUser.emailVerified) {
    return null;
  }

  return <>{children}</>;
}

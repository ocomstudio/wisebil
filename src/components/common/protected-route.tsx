// src/components/common/protected-route.tsx
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // If there is no authenticated user at all, send to landing page.
    if (!firebaseUser) {
      // Allow access to public, non-dashboard routes
      if (!pathname.startsWith('/dashboard')) {
        return;
      }
      router.push('/');
      return;
    }
    
    // If user is authenticated and they land on a public or auth page, redirect to dashboard.
    if (pathname === '/' || pathname.startsWith('/auth')) {
        router.push('/dashboard');
        return;
    }

  }, [firebaseUser, isLoading, router, pathname]);

  // While loading, show a full-screen skeleton.
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  // If user is not authenticated and is trying to access a protected route,
  // we show nothing while redirecting.
  if (!firebaseUser && pathname.startsWith('/dashboard')) {
      return null;
  }

  return <>{children}</>;
}

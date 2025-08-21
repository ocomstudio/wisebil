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

    // If there is no authenticated user at all, send to landing page.
    if (!firebaseUser) {
      // Allow access to landing page related routes
      if (pathname === '/' || pathname.startsWith('/#')) {
        return;
      }
      router.push('/');
      return;
    }

    // If firebaseUser exists, proceed with checks
    if (firebaseUser) {
      // If email is not verified, redirect to verification page, unless they are already there.
      if (!firebaseUser.emailVerified && pathname !== '/auth/verify-email') {
        router.push('/auth/verify-email');
        return;
      }

      // If email is verified, but local profile is not complete, redirect to completion page.
      if (firebaseUser.emailVerified && !user?.profileComplete && pathname !== '/auth/complete-profile') {
        router.push('/auth/complete-profile');
        return;
      }

      // If everything is complete, and they land on an auth page, redirect to dashboard.
      if (user?.profileComplete && (pathname.startsWith('/auth/') || pathname === '/')) {
        router.push('/dashboard');
        return;
      }
    }

  }, [firebaseUser, user, isLoading, router, pathname]);

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
  if (!firebaseUser && pathname !== '/') {
      return null;
  }
  
  // If user is authenticated but not fully set up, we also show nothing
  // during the redirect to the appropriate auth page.
  if(firebaseUser && (!firebaseUser.emailVerified || !user?.profileComplete) && !pathname.startsWith('/auth/')) {
    return null;
  }

  return <>{children}</>;
}


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

    const isAuthPage = pathname.startsWith('/auth');
    const isPublicPage = ['/', '/contact', '/privacy-policy', '/terms-of-service'].includes(pathname) || isAuthPage;

    if (!firebaseUser) {
      if (isPublicPage) {
        return;
      }
      const intendedUrl = pathname;
      sessionStorage.setItem('redirect_url', intendedUrl);
      router.push('/');
      return;
    }
    
    // User is authenticated
    const redirectUrl = sessionStorage.getItem('redirect_url');
    sessionStorage.removeItem('redirect_url');

    const planToSubscribe = sessionStorage.getItem('redirect_plan');
     if (planToSubscribe) {
        sessionStorage.removeItem('redirect_plan');
        router.push('/dashboard/billing');
        return;
    }

    if (redirectUrl && redirectUrl !== pathname) {
        router.push(redirectUrl);
        return;
    }

    if (isAuthPage || pathname === '/') {
        router.push('/dashboard');
        return;
    }

  }, [firebaseUser, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!firebaseUser && !pathname.startsWith('/auth') && pathname !== '/') {
      return null;
  }

  return <>{children}</>;
}

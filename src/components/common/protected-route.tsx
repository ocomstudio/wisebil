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

    // If there is no authenticated user
    if (!firebaseUser) {
      if (isPublicPage) {
        // Allow access to public pages
        return;
      }
      // For protected pages, redirect to home to login/signup
      router.push('/');
      return;
    }
    
    // If user is authenticated and tries to access a public page (except contact/legal)
    if (isAuthPage || pathname === '/') {
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
  if (!firebaseUser && !pathname.startsWith('/auth') && pathname !== '/') {
      return null;
  }

  return <>{children}</>;
}

// src/components/dashboard/bottom-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart, Settings, Target, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/context/locale-context';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ScanReceiptPage from '@/app/dashboard/scan-receipt/page';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [isScanOpen, setIsScanOpen] = useState(false);
  const { user } = useAuth();

  const isEmailUnverified = user?.email && !user.emailVerified;

  const navItems = [
    { href: '/dashboard', label: t('nav_home'), icon: Home },
    { href: '/dashboard/reports', label: t('nav_reports'), icon: BarChart },
    { href: '/dashboard/scan-receipt', label: t('nav_scan'), icon: ScanLine },
    { href: '/dashboard/budget', label: t('nav_budgets'), icon: Target },
    { href: '/dashboard/settings', label: t('nav_settings'), icon: Settings, notification: isEmailUnverified },
  ];

  return (
    <footer id="bottom-nav-tutorial" className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <Dialog open={isScanOpen} onOpenChange={setIsScanOpen}>
        <nav className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = item.href && pathname === item.href;
            if (item.label === t('nav_scan')) {
              return (
                <DialogTrigger asChild key={item.label}>
                  <div className="flex flex-col items-center justify-center -mt-6 cursor-pointer">
                    <div className="bg-primary text-primary-foreground p-4 rounded-full flex items-center justify-center shadow-lg border-4 border-background">
                      <item.icon className="h-8 w-8" />
                    </div>
                    <span className="text-xs mt-1 font-medium text-primary">{item.label}</span>
                  </div>
                </DialogTrigger>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href || '#'}
                className={cn(
                  'flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors w-16 relative',
                  isActive && 'text-primary'
                )}
              >
                <item.icon className={cn('h-6 w-6')} />
                <span className={cn('text-xs mt-1')}>{item.label}</span>
                 {item.notification && (
                    <span className="absolute top-1 right-4 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
              </Link>
            );
          })}
        </nav>
        <DialogContent className="p-0 m-0 w-screen h-screen max-w-full max-h-screen border-0 rounded-none overflow-hidden">
            <ScanReceiptPage onComplete={() => setIsScanOpen(false)} />
        </DialogContent>
      </Dialog>
    </footer>
  );
}

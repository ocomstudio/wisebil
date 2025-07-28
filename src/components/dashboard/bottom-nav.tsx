// src/components/dashboard/bottom-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart, PlusCircle, Shield, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTransactionDialog } from './add-transaction-dialog';

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/dashboard/reports', label: 'Statistiques', icon: BarChart },
  { isCentral: true, label: 'Ajouter', icon: PlusCircle },
  { href: '/dashboard/savings', label: 'Épargne', icon: Shield },
  { href: '/dashboard/assistant', label: 'Conseils', icon: Bot },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t border-border z-50">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item, index) => {
          if (item.isCentral) {
            return (
              <div key={index} className={cn('-mt-8')}>
                 <AddTransactionDialog isMobile={true} />
              </div>
            )
          }

          const isActive = item.href && pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href || '#'}
              className={cn(
                'flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors',
                isActive && 'text-primary'
              )}
            >
              <div className={cn('flex items-center justify-center rounded-full')}>
                <item.icon className={cn('h-6 w-6')} />
              </div>
              <span className={cn('text-xs mt-1')}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}

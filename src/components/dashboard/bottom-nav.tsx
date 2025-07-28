// src/components/dashboard/bottom-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart, Plus, User, Shield, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTransactionDialog } from './add-transaction-dialog';

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/dashboard/reports', label: 'Statistiques', icon: BarChart },
  { href: '/dashboard/budget', label: 'Budgets', icon: Target },
  { href: '/dashboard/savings', label: 'Épargne', icon: Shield },
  { href: '/dashboard/assistant', label: 'Assistant', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item, index) => {
          const isActive = item.href && pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href || '#'}
              className={cn(
                'flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors w-16',
                isActive && 'text-primary'
              )}
            >
              <item.icon className={cn('h-6 w-6')} />
              <span className={cn('text-xs mt-1')}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}

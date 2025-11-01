// src/components/dashboard/dashboard-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Bell, Info } from "lucide-react";
import Link from "next/link";
import { Logo } from "../common/logo";
import { UserProfile } from "./user-profile";
import { useLocale } from '@/context/locale-context';
import { Badge } from '../ui/badge';
import { useNotifications } from '@/context/notifications-context';

export function DashboardHeader() {
  const { t } = useLocale();
  const { unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b bg-background md:px-6 md:justify-end">
      {/* Logo visible only on mobile */}
      <div className="md:hidden">
        <Logo />
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Info button for desktop */}
        <Button variant="ghost" size="icon" className="hidden md:inline-flex rounded-full" asChild>
          <Link href="/about" aria-label={t('about_title')}>
            <Info className="h-5 w-5" />
          </Link>
        </Button>
        
        {/* Notifications button */}
        <Button variant="ghost" size="icon" asChild className="relative rounded-full">
          <Link href="/dashboard/notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadCount}</Badge>
            )}
            <span className="sr-only">{t('notifications')}</span>
          </Link>
        </Button>

        {/* User Profile */}
        <UserProfile />
      </div>
    </header>
  );
}

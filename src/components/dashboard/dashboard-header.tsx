// src/components/dashboard/dashboard-header.tsx
"use client";
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Bell, Lightbulb, Wallet, Shield, Landmark } from "lucide-react";
import Link from "next/link";
import { Logo } from "../common/logo";
import { UserProfile } from "./user-profile";
import { useLocale } from '@/context/locale-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Badge } from '../ui/badge';
import { useNotifications } from '@/context/notifications-context';


export function DashboardHeader() {
  const { t } = useLocale();
  const { unreadCount } = useNotifications();
  
  const playNotificationSound = () => {
    // Note for developer: Place your notification sound file (e.g., notification.mp3) in the /public folder.
    const audio = new Audio('/notification.mp3');
    audio.play().catch(error => console.error("Error playing sound:", error));
  };

  const handleNotificationClick = () => {
    playNotificationSound();
    toast.custom((toastObject) => (
      <div
        className={`${
          toastObject.visible ? 'animate-fade-in-up' : 'animate-out'
        } max-w-md w-full bg-card shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="p-2 bg-primary/20 rounded-full">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-foreground">
                {t('tip_of_the_day')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('toast_tip_desc')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-border">
          <button
            onClick={() => toast.dismiss(toastObject.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {t('toast_close_button')}
          </button>
        </div>
      </div>
    ), {
        vibrate: 1, // Add vibration on notification
    });
  }


  return (
    <header className="flex items-center justify-between p-4 border-b bg-background md:hidden">
      <Logo />
      <div className="flex items-center gap-1">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Wallet className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end" forceMount>
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/savings">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>{t('nav_savings')}</span>
                        </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link href="/dashboard/accounts">
                            <Landmark className="mr-2 h-4 w-4" />
                            <span>{t('nav_accounts')}</span>
                            <Badge variant="secondary" className="ml-auto">Bientôt</Badge>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>

         <Button variant="ghost" size="icon" asChild className="rounded-full relative">
          <Link href="/dashboard/notifications">
            <Bell className="h-5 w-5" />
             {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadCount}</Badge>
            )}
          </Link>
        </Button>
        <UserProfile />
      </div>
    </header>
  );
}

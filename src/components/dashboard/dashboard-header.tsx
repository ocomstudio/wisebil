// src/components/dashboard/dashboard-header.tsx
"use client";
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Bell, Lightbulb, Wallet, Shield, Landmark, Menu } from "lucide-react";
import Link from "next/link";
import { Logo } from "../common/logo";
import { UserProfile } from "./user-profile";
import { useLocale } from '@/context/locale-context';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
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
    const audio = new Audio('/notification.mp3');
    audio.play().catch(error => console.error("Error playing sound:", error));
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background md:hidden">
       <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Ouvrir le menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-4">
                <Logo />
                <SidebarNav />
            </SheetContent>
        </Sheet>
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
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>

         <Button variant="ghost" size="icon" asChild className="relative" onClick={playNotificationSound}>
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

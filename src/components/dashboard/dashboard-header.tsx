// src/components/dashboard/dashboard-header.tsx
"use client";
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Bell, Lightbulb } from "lucide-react";
import Link from "next/link";
import { Logo } from "../common/logo";
import { UserProfile } from "./user-profile";

export function DashboardHeader() {
  const handleNotificationClick = () => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-fade-in-up' : 'animate-out'
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
                Astuce du jour
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pensez à noter vos petites dépenses, elles s'additionnent vite !
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-border">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Fermer
          </button>
        </div>
      </div>
    ), {
        vibrate: 1, // Vibrate for 200ms
        sound: 'default'
    });
  }


  return (
    <header className="flex items-center justify-between p-4 border-b bg-background md:hidden">
      <Logo />
      <div className="flex items-center gap-2">
         <Button variant="ghost" size="icon" asChild className="rounded-full" onClick={handleNotificationClick}>
          <Link href="/dashboard/notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>
        <UserProfile />
      </div>
    </header>
  );
}

// src/components/dashboard/dashboard-header.tsx
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import Link from "next/link";
import { Logo } from "../common/logo";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b md:hidden">
      <div className="flex items-center gap-2">
        <Avatar>
            <AvatarFallback>D</AvatarFallback>
        </Avatar>
        <div>
            <p className="text-xs text-muted-foreground">Bienvenue</p>
            <p className="font-semibold">David</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>
        <SidebarTrigger />
      </div>
    </header>
  );
}

// src/components/dashboard/dashboard-header.tsx
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Settings, UserCircle, CreditCard } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdBanner } from "./ad-banner";

export function DashboardHeader() {
  const userName = "David"; // This would come from user data

  return (
    <header className="flex items-center justify-between p-4 border-b md:hidden">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>
                <p className="font-semibold">{userName}</p>
                <p className="text-xs text-muted-foreground font-normal">Bienvenue</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
              <Link href="/dashboard/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Abonnement</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <div className="p-2">
                <AdBanner />
             </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div>
            <p className="text-xs text-muted-foreground">Bienvenue</p>
            <p className="font-semibold">{userName}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

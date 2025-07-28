// src/components/dashboard/dashboard-header.tsx
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function DashboardHeader() {
  const userName = "David"; // This would come from user data

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background md:hidden">
      <div className="flex items-center gap-3">
        <Avatar className="cursor-pointer h-10 w-10">
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>

        <div>
            <p className="text-sm text-muted-foreground">Bienvenue,</p>
            <p className="font-semibold text-lg">{userName}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/dashboard/notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

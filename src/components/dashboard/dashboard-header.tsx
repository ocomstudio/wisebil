// src/components/dashboard/dashboard-header.tsx
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Logo } from "../common/logo";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-background md:hidden">
      <Logo />
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


"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart, Lightbulb, Home, Settings, Shield, Target, Wallet, Bell } from "lucide-react"

export function SidebarNav() {
  const pathname = usePathname()

  const menuItems = [
    {
      href: "/dashboard",
      label: "Accueil",
      icon: <Home />,
    },
    {
      href: "/dashboard/reports",
      label: "Rapports",
      icon: <BarChart />,
    },
    {
      href: "/dashboard/budget",
      label: "Budgets",
      icon: <Target />,
    },
    {
      href: "/dashboard/savings",
      label: "Épargne",
      icon: <Shield />,
    },
     {
      href: "/dashboard/conseil",
      label: "Conseil",
      icon: <Lightbulb />,
    },
    {
      href: "/dashboard/accounts",
      label: "Comptes",
      icon: <Wallet />
    },
    {
      href: "/dashboard/notifications",
      label: "Notifications",
      icon: <Bell />
    },
    {
      href: "/dashboard/settings",
      label: "Paramètres",
      icon: <Settings />,
    },
  ]

  return (
     <nav className="flex flex-col gap-2">
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10",
            (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && "bg-primary/10 text-primary"
          )}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

// src/components/dashboard/sidebar-nav.tsx
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart, Lightbulb, Home, Settings, Shield, Target, Wallet, Bell } from "lucide-react"
import { useLocale } from "@/context/locale-context";
import { useAuth } from "@/context/auth-context";

export function SidebarNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { user } = useAuth();
  
  const menuItems = [
    {
      href: "/dashboard",
      label: t('nav_home'),
      icon: <Home />,
    },
    {
      href: "/dashboard/reports",
      label: t('nav_reports'),
      icon: <BarChart />,
    },
    {
      href: "/dashboard/budget",
      label: t('nav_budgets'),
      icon: <Target />,
    },
    {
      href: "/dashboard/savings",
      label: t('nav_savings'),
      icon: <Shield />,
    },
    {
      href: "/dashboard/accounts",
      label: t('nav_accounts'),
      icon: <Wallet />
    },
    {
      href: "/dashboard/notifications",
      label: t('nav_notifications'),
      icon: <Bell />
    },
    {
      href: "/dashboard/settings",
      label: t('nav_settings'),
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
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10 relative",
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


"use client"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { BarChart, Bot, Home, Settings, Shield, Target, Wallet } from "lucide-react"
import { usePathname } from "next/navigation"

export function SidebarNav() {
  const pathname = usePathname()

  const menuItems = [
    {
      href: "/dashboard",
      label: "Accueil",
      icon: <Home />,
    },
    {
      href: "/dashboard/assistant",
      label: "Assistant",
      icon: <Bot />,
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
      href: "/dashboard/accounts",
      label: "Comptes",
      icon: <Wallet />
    },
    {
      href: "/dashboard/settings",
      label: "Paramètres",
      icon: <Settings />,
    },
  ]

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            href={item.href}
            isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
            asChild
          >
            <span>
              {item.icon}
              <span>{item.label}</span>
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

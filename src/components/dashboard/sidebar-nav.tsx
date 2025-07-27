
"use client"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { BarChart, Home, MessageSquare, Settings } from "lucide-react"
import { usePathname } from "next/navigation"

export function SidebarNav() {
  const pathname = usePathname()

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home />,
    },
    {
      href: "/dashboard/assistant",
      label: "Assistant",
      icon: <MessageSquare />,
    },
    {
      href: "/dashboard/reports",
      label: "Reports",
      icon: <BarChart />,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings />,
    },
  ]

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            href={item.href}
            isActive={pathname === item.href}
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

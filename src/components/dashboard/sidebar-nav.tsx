// src/components/dashboard/sidebar-nav.tsx
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart, Lightbulb, Home, Settings, Shield, Target, Wallet, Bell, Building, Package, ShoppingCart, Activity, RefreshCw } from "lucide-react"
import { useLocale } from "@/context/locale-context";
import { useAuth } from "@/context/auth-context";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { ScrollArea } from "../ui/scroll-area";

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
  ];

  const isEnterpriseActive = pathname.startsWith('/dashboard/entreprise');
  const isSettingsActive = pathname.startsWith('/dashboard/settings');


  return (
     <ScrollArea className="flex-1 mt-6">
        <nav className="flex flex-col gap-2 pr-4">
        {menuItems.map((item) => (
            <Link
            key={item.href}
            href={item.href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10 relative",
                (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && !pathname.startsWith('/dashboard/entreprise'))) && "bg-primary/10 text-primary",
                item.className
            )}
            >
            {item.icon}
            {item.label}
            </Link>
        ))}
        <Accordion type="multiple" defaultValue={isEnterpriseActive ? ['enterprise-menu'] : []} className="w-full">
            <AccordionItem value="enterprise-menu" className="border-b-0">
            <AccordionTrigger className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10 hover:no-underline", isEnterpriseActive && "bg-primary/10 text-primary")}>
                <Link href="/dashboard/entreprise" className="flex items-center gap-3 w-full">
                  <Building />
                  {t('nav_enterprise')}
                </Link>
            </AccordionTrigger>
            <AccordionContent className="pl-6 pt-2 space-y-1">
                <Link href="/dashboard/entreprise/products" className={cn("flex items-center gap-2 rounded-md p-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5", pathname.startsWith('/dashboard/entreprise/products') && 'text-primary bg-primary/5')}>
                    <Package className="h-4 w-4"/> {t('nav_products')}
                </Link>
                <Link href="/dashboard/entreprise/sales/invoices" className={cn("flex items-center gap-2 rounded-md p-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5", pathname.startsWith('/dashboard/entreprise/sales') && 'text-primary bg-primary/5')}>
                    <ShoppingCart className="h-4 w-4"/> {t('nav_sales')}
                </Link>
                <Link href="/dashboard/entreprise/purchases/invoices" className={cn("flex items-center gap-2 rounded-md p-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5", pathname.startsWith('/dashboard/entreprise/purchases') && 'text-primary bg-primary/5')}>
                    <RefreshCw className="h-4 w-4"/> {t('nav_purchases')}
                </Link>
            </AccordionContent>
            </AccordionItem>
        </Accordion>
        <Link
            href="/dashboard/settings"
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10 relative",
                isSettingsActive && "bg-primary/10 text-primary"
            )}
            >
            <Settings />
            {t('nav_settings')}
            </Link>
        </nav>
    </ScrollArea>
  )
}

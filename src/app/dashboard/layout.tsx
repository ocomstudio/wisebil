// src/app/dashboard/layout.tsx
"use client";

import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { AdBanner } from "@/components/dashboard/ad-banner";
import { Logo } from "@/components/common/logo";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { TransactionsProvider } from "@/context/transactions-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TransactionsProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between">
              <Logo />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter>
            <AdBanner />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
          <BottomNav />
        </SidebarInset>
      </SidebarProvider>
    </TransactionsProvider>
  );
}

// src/app/dashboard/layout.tsx
"use client";

import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Logo } from "@/components/common/logo";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { TransactionsProvider } from "@/context/transactions-context";
import { AssistantPanel } from "@/components/dashboard/assistant-panel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TransactionsProvider>
      <div className="md:grid md:grid-cols-[250px_1fr_350px] min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col gap-6 p-4 border-r bg-secondary/20">
          <div className="px-2">
            <Logo />
          </div>
          <SidebarNav />
        </aside>

        {/* Mobile Header */}
        <DashboardHeader />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 bg-secondary/30">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
        
        {/* Mobile Bottom Nav */}
        <BottomNav />
        
        {/* Desktop AI Assistant */}
        <aside className="hidden md:flex flex-col border-l bg-secondary/20">
          <AssistantPanel />
        </aside>
      </div>
    </TransactionsProvider>
  );
}

// src/app/dashboard/layout.tsx
"use client";

import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Logo } from "@/components/common/logo";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { TransactionsProvider } from "@/context/transactions-context";
import { ConseilPanel } from "@/components/dashboard/conseil-panel";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { UserProfile } from "@/components/dashboard/user-profile";
import { BudgetProvider } from "@/context/budget-context";
import { SavingsProvider } from "@/context/savings-context";
import { SettingsProvider } from "@/context/settings-context";
import { AuthProvider } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/common/protected-route";

// Import AI flows to prevent tree-shaking
import * as aiFlows from '@/ai/flows';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <SettingsProvider>
          <TransactionsProvider>
            <BudgetProvider>
              <SavingsProvider>
                <div className="grid h-screen w-full overflow-hidden md:grid-cols-[250px_1fr_350px]">
                  {/* Desktop Sidebar */}
                  <aside className="hidden border-r bg-muted/40 md:flex flex-col gap-6 p-4">
                    <div className="px-2">
                      <Logo />
                    </div>
                    <SidebarNav />
                  </aside>

                  <div className="flex flex-col overflow-hidden">
                    {/* Desktop Header */}
                    <header className="hidden md:flex items-center justify-end h-14 px-6 border-b bg-muted/40 flex-shrink-0">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Bell className="h-5 w-5" />
                            <span className="sr-only">Notifications</span>
                          </Button>
                        <UserProfile />
                      </div>
                    </header>

                    {/* Mobile Header */}
                    <DashboardHeader />

                    {/* Main Content */}
                    <main className="flex-1 p-4 md:p-8 bg-background md:bg-muted/40 overflow-y-auto">
                      <div className="max-w-6xl mx-auto">{children}</div>
                    </main>
                  </div>
                  
                  {/* Mobile Bottom Nav */}
                  <BottomNav />
                  
                  {/* Desktop AI Assistant */}
                  <aside className="hidden md:flex flex-col border-l bg-muted/40 h-screen">
                    <ConseilPanel />
                  </aside>
                </div>
              </SavingsProvider>
            </BudgetProvider>
          </TransactionsProvider>
        </SettingsProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

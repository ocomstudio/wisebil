// src/app/dashboard/layout.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Logo } from "@/components/common/logo";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { TransactionsProvider } from "@/context/transactions-context";
import { ConseilPanel } from "@/components/dashboard/conseil-panel";
import { BudgetProvider } from "@/context/budget-context";
import { SavingsProvider } from "@/context/savings-context";
import { SettingsProvider } from "@/context/settings-context";
import { AuthProvider } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/common/protected-route";
import { Toaster as HotToaster } from 'react-hot-toast';
import { LocaleProvider } from "@/context/locale-context";
import { TutorialProvider } from "@/context/tutorial-context";
import { NotificationsProvider } from "@/context/notifications-context";
import { TeamChatProvider } from "@/context/team-chat-context";
import { TeamChat } from "@/components/dashboard/team/team-chat";
import { UserDataProvider } from "@/context/user-context";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTeamChatPanel = pathname.startsWith('/dashboard/entreprise/management');

  return (
    <div className="grid h-dvh w-full md:grid-cols-[250px_1fr_350px]">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-muted/40 md:flex flex-col gap-6 p-4">
        <div className="px-2">
          <Logo />
        </div>
        <SidebarNav />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background md:bg-muted/40 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Right Panel: Conditional rendering of TeamChat or ConseilPanel */}
      <aside className="hidden md:flex flex-col border-l bg-muted/40">
        {showTeamChatPanel ? <TeamChat /> : <ConseilPanel />}
      </aside>
      
      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <UserDataProvider>
          <LocaleProvider>
            <SettingsProvider>
              <TransactionsProvider>
                  <BudgetProvider>
                    <SavingsProvider>
                      <NotificationsProvider>
                        <TutorialProvider>
                            <TeamChatProvider>
                              <DashboardLayoutContent>{children}</DashboardLayoutContent>
                            </TeamChatProvider>
                        </TutorialProvider>
                      </NotificationsProvider>
                      <HotToaster
                        position="top-center"
                        toastOptions={{
                          className: 'bg-card text-card-foreground',
                        }}
                      />
                    </SavingsProvider>
                  </BudgetProvider>
              </TransactionsProvider>
            </SettingsProvider>
          </LocaleProvider>
        </UserDataProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

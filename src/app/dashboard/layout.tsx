// src/app/dashboard/layout.tsx
"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Logo } from "@/components/common/logo";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { TransactionsProvider } from "@/context/transactions-context";
import { ConseilPanel } from "@/components/dashboard/conseil-panel";
import { Button } from "@/components/ui/button";
import { Bell, Info } from "lucide-react";
import { UserProfile } from "@/components/dashboard/user-profile";
import { BudgetProvider } from "@/context/budget-context";
import { SavingsProvider } from "@/context/savings-context";
import { SettingsProvider } from "@/context/settings-context";
import { AuthProvider } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/common/protected-route";
import { Toaster as HotToaster } from 'react-hot-toast';
import Link from "next/link";
import { LocaleProvider, useLocale } from "@/context/locale-context";
import { TutorialProvider } from "@/context/tutorial-context";
import { useNotifications } from "@/context/notifications-context";
import { Badge } from "@/components/ui/badge";
import { NotificationsProvider } from "@/context/notifications-context";
import { AccountingProvider } from "@/context/accounting-context";
import { InvoicingProvider } from "@/context/invoicing-context";
import { cn } from "@/lib/utils";
import { TeamChatProvider } from "@/context/team-chat-context";
import { TeamChat } from "@/components/dashboard/team/team-chat";
import { EnterpriseProvider } from "@/context/enterprise-context";
import { UserDataProvider } from "@/context/user-context";
import { CompanyProfileProvider } from "@/context/company-profile-context";


function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  // Hide main layout for the full-screen scan page on mobile
  if (pathname.startsWith('/dashboard/scan-receipt')) {
    return <div className="h-screen w-screen">{children}</div>;
  }
  
  const showTeamChatPanel = pathname.startsWith('/dashboard/entreprise/management');
  
  return (
    <div className={cn("grid h-screen w-full overflow-hidden", showTeamChatPanel ? "md:grid-cols-[250px_1fr_350px]" : "md:grid-cols-[250px_1fr_350px]")}>
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
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="/about" aria-label={t('about_title')}>
                    <Info className="h-5 w-5" />
                </Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full relative" asChild>
              <Link href="/dashboard/notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                   <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadCount}</Badge>
                )}
                <span className="sr-only">{t('notifications')}</span>
              </Link>
            </Button>
            <UserProfile />
          </div>
        </header>

        {/* Mobile Header */}
        <DashboardHeader />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 bg-background md:bg-muted/40 overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto h-full">{children}</div>
        </main>
      </div>
      
      {/* Mobile Bottom Nav */}
      <BottomNav />
      
      {/* Right Panel: Conditional rendering of TeamChat or ConseilPanel */}
      <aside className="hidden md:flex flex-col border-l bg-muted/40 h-screen">
          {showTeamChatPanel ? <TeamChat /> : <ConseilPanel />}
      </aside>
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
                <EnterpriseProvider>
                  <BudgetProvider>
                    <SavingsProvider>
                      <NotificationsProvider>
                        <CompanyProfileProvider>
                          <AccountingProvider>
                            <InvoicingProvider>
                              <TutorialProvider>
                                <TeamChatProvider>
                                  <DashboardLayoutContent>{children}</DashboardLayoutContent>
                                </TeamChatProvider>
                              </TutorialProvider>
                            </InvoicingProvider>
                          </AccountingProvider>
                        </CompanyProfileProvider>
                      </NotificationsProvider>
                      <HotToaster
                        position="top-center"
                        toastOptions={{
                          className: 'bg-card text-card-foreground',
                        }}
                      />
                    </SavingsProvider>
                  </BudgetProvider>
                </EnterpriseProvider>
              </TransactionsProvider>
            </SettingsProvider>
          </LocaleProvider>
        </UserDataProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

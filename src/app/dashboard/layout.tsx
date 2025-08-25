// src/app/dashboard/layout.tsx
"use client";

import { usePathname } from "next/navigation";
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
import { Toaster as HotToaster } from 'react-hot-toast';
import Link from "next/link";
import { LocaleProvider, useLocale } from "@/context/locale-context";
import { TutorialProvider } from "@/context/tutorial-context";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const pathname = usePathname();

  // Hide main layout for the full-screen scan page on mobile
  if (pathname.startsWith('/dashboard/scan-receipt')) {
    return <div className="h-screen w-screen">{children}</div>;
  }

  return (
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
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="/dashboard/notifications">
                <Bell className="h-5 w-5" />
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
      
      {/* Desktop AI Assistant */}
      <aside id="conseil-panel-tutorial" className="hidden md:flex flex-col border-l bg-muted/40 h-screen">
        <ConseilPanel />
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
        <LocaleProvider>
          <SettingsProvider>
            <TransactionsProvider>
              <BudgetProvider>
                <SavingsProvider>
                  <TutorialProvider>
                    <DashboardLayoutContent>{children}</DashboardLayoutContent>
                  </TutorialProvider>
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
      </ProtectedRoute>
    </AuthProvider>
  );
}

// src/app/dashboard/accounting/page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartOfAccounts } from "@/components/dashboard/accounting/chart-of-accounts";
import { JournalEntries } from "@/components/dashboard/accounting/journal-entries";
import { GeneralLedger } from "@/components/dashboard/accounting/general-ledger";
import { TrialBalance } from "@/components/dashboard/accounting/trial-balance";
import { useAccounting } from "@/context/accounting-context";
import { AccountingDashboard } from "@/components/dashboard/accounting/accounting-dashboard";
import InvoicingPage from "./invoicing/page";
import { IncomeStatement } from "@/components/dashboard/accounting/income-statement";
import { useLocale } from "@/context/locale-context";

export default function AccountingPage() {
  const { t } = useLocale();
  const { entries, addEntry } = useAccounting();

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Comptabilité</h1>
      </div>

       <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
           <TabsTrigger value="dashboard">
            Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="invoicing">
            Facturation
          </TabsTrigger>
          <TabsTrigger value="journals">
            Journaux
          </TabsTrigger>
           <TabsTrigger value="ledger">
            Grand Livre
          </TabsTrigger>
           <TabsTrigger value="income-statement">
            Compte de Résultat
          </TabsTrigger>
          <TabsTrigger value="chart-of-accounts">
            Plan Comptable
          </TabsTrigger>
           <TabsTrigger value="balance" className="hidden">
            Balance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
            <AccountingDashboard entries={entries} />
        </TabsContent>
         <TabsContent value="invoicing" className="space-y-4">
            <InvoicingPage />
        </TabsContent>
        <TabsContent value="journals" className="space-y-4">
            <JournalEntries entries={entries} setEntries={addEntry as any} />
        </TabsContent>
        <TabsContent value="ledger" className="space-y-4">
            <GeneralLedger entries={entries} />
        </TabsContent>
         <TabsContent value="income-statement" className="space-y-4">
            <IncomeStatement entries={entries} />
        </TabsContent>
        <TabsContent value="chart-of-accounts" className="space-y-4">
            <ChartOfAccounts />
        </TabsContent>
        <TabsContent value="balance" className="space-y-4">
            <TrialBalance entries={entries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

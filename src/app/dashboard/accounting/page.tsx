// src/app/dashboard/accounting/page.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartOfAccounts } from "@/components/dashboard/accounting/chart-of-accounts";
import { JournalEntries, type JournalEntry } from "@/components/dashboard/accounting/journal-entries";
import { GeneralLedger } from "@/components/dashboard/accounting/general-ledger";

export default function AccountingPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Comptabilité</h1>
      </div>

       <Tabs defaultValue="journals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="journals">
            Journaux
          </TabsTrigger>
           <TabsTrigger value="ledger">
            Grand Livre
          </TabsTrigger>
          <TabsTrigger value="chart-of-accounts">
            Plan Comptable
          </TabsTrigger>
           <TabsTrigger value="balance" disabled>
            Balance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="journals" className="space-y-4">
            <JournalEntries entries={entries} setEntries={setEntries} />
        </TabsContent>
        <TabsContent value="ledger" className="space-y-4">
            <GeneralLedger entries={entries} />
        </TabsContent>
        <TabsContent value="chart-of-accounts" className="space-y-4">
            <ChartOfAccounts />
        </TabsContent>
      </Tabs>
    </div>
  );
}

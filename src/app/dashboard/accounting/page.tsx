// src/app/dashboard/accounting/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartOfAccounts } from "@/components/dashboard/accounting/chart-of-accounts";
import { FilePlus } from "lucide-react";

export default function AccountingPage() {

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Comptabilité</h1>
        <Button>
          <FilePlus className="mr-2 h-4 w-4" />
          Nouvelle Écriture
        </Button>
      </div>

       <Tabs defaultValue="chart-of-accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart-of-accounts">
            Plan Comptable
          </TabsTrigger>
          <TabsTrigger value="journals" disabled>
            Journaux
          </TabsTrigger>
          <TabsTrigger value="ledger" disabled>
            Grand Livre
          </TabsTrigger>
           <TabsTrigger value="balance" disabled>
            Balance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart-of-accounts" className="space-y-4">
            <ChartOfAccounts />
        </TabsContent>
      </Tabs>
    </div>
  );
}

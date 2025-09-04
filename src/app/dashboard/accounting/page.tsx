// src/app/dashboard/accounting/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, Construction } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";

// Note: The original accounting page content is commented out below to be easily restored later.
/*
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartOfAccounts } from "@/components/dashboard/accounting/chart-of-accounts";
import { JournalEntries } from "@/components/dashboard/accounting/journal-entries";
import { GeneralLedger } from "@/components/dashboard/accounting/general-ledger";
import { TrialBalance } from "@/components/dashboard/accounting/trial-balance";
import { useAccounting } from "@/context/accounting-context";
import { AccountingDashboard } from "@/components/dashboard/accounting/accounting-dashboard";
import InvoicingPage from "./invoicing/page";
import { IncomeStatement } from "@/components/dashboard/accounting/income-statement";
*/

export default function AccountingPage() {
  const { t } = useLocale();

  /*
  const { entries, addEntry } = useAccounting();
  */

  return (
     <div className="flex items-center justify-center h-full pt-10 md:pt-0">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full mb-4 w-fit">
            <Briefcase className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="font-headline">{t('coming_soon_title')}</CardTitle>
          <CardDescription>
            Le module complet de comptabilité et de facturation est en cours de finalisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
                Nous travaillons d'arrache-pied pour vous apporter des outils puissants pour gérer votre comptabilité comme un pro. Merci pour votre patience !
            </p>
             <div className="flex justify-center">
                 <Button asChild variant="outline">
                    <Link href="/dashboard/entreprise">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à l'Espace Entreprise
                    </Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
    
    /*
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Comptabilité</h1>
      </div>

       <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
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
           <TabsTrigger value="balance">
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
    */
  );
}

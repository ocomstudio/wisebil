// src/components/dashboard/accounting/trial-balance.tsx
"use client";

import { useMemo } from "react";
import type { JournalEntry } from "./journal-entries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { syscohadaChartOfAccounts } from "@/config/chart-of-accounts-data";
import { cn } from "@/lib/utils";

interface TrialBalanceProps {
    entries: JournalEntry[];
}

interface TrialBalanceAccount {
    accountNumber: number;
    accountName: string;
    totalDebit: number;
    totalCredit: number;
}

export function TrialBalance({ entries }: TrialBalanceProps) {
    
    const { trialBalanceAccounts, totalDebit, totalCredit } = useMemo(() => {
        const accountMap = new Map<number, { totalDebit: number; totalCredit: number }>();

        entries.forEach(entry => {
            const { accountNumber, debit = 0, credit = 0 } = entry;
            if (!accountMap.has(accountNumber)) {
                accountMap.set(accountNumber, { totalDebit: 0, totalCredit: 0 });
            }
            const accountTotals = accountMap.get(accountNumber)!;
            accountTotals.totalDebit += debit;
            accountTotals.totalCredit += credit;
        });

        const trialBalanceAccounts: TrialBalanceAccount[] = Array.from(accountMap.entries()).map(([accountNumber, totals]) => {
            const accountInfo = syscohadaChartOfAccounts.find(acc => acc.accountNumber === accountNumber);
            return {
                accountNumber,
                accountName: accountInfo?.accountName || "Compte Inconnu",
                totalDebit: totals.totalDebit,
                totalCredit: totals.totalCredit,
            };
        }).sort((a,b) => a.accountNumber - b.accountNumber);

        const totalDebit = trialBalanceAccounts.reduce((sum, acc) => sum + acc.totalDebit, 0);
        const totalCredit = trialBalanceAccounts.reduce((sum, acc) => sum + acc.totalCredit, 0);

        return { trialBalanceAccounts, totalDebit, totalCredit };

    }, [entries]);

    return (
         <Card>
            <CardHeader>
                <CardTitle>Balance Comptable</CardTitle>
                <CardDescription>
                    Vérifiez l'équilibre de vos comptes. Le total des débits doit être égal au total des crédits.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Compte</TableHead>
                                <TableHead>Libellé</TableHead>
                                <TableHead className="text-right w-[150px]">Débit</TableHead>
                                <TableHead className="text-right w-[150px]">Crédit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {trialBalanceAccounts.length > 0 ? (
                                trialBalanceAccounts.map(account => (
                                    <TableRow key={account.accountNumber}>
                                        <TableCell className="font-medium">{account.accountNumber}</TableCell>
                                        <TableCell>{account.accountName}</TableCell>
                                        <TableCell className="text-right">{account.totalDebit.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{account.totalCredit.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Aucune écriture pour générer la balance.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-muted/50 font-bold text-lg">
                                <TableCell colSpan={2} className="text-right">Totaux</TableCell>
                                <TableCell className={cn("text-right", totalDebit !== totalCredit && "text-destructive")}>
                                    {totalDebit.toLocaleString()}
                                </TableCell>
                                <TableCell className={cn("text-right", totalDebit !== totalCredit && "text-destructive")}>
                                    {totalCredit.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
                 {totalDebit !== totalCredit && trialBalanceAccounts.length > 0 && (
                     <p className="text-center text-destructive font-semibold mt-4">
                        Attention : La balance est déséquilibrée !
                     </p>
                )}
            </CardContent>
        </Card>
    );
}

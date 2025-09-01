// src/components/dashboard/accounting/general-ledger.tsx
"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import type { JournalEntry } from "./journal-entries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { syscohadaChartOfAccounts } from "@/config/chart-of-accounts-data";
import { cn } from "@/lib/utils";

interface GeneralLedgerProps {
    entries: JournalEntry[];
}

interface LedgerAccount {
    accountNumber: number;
    accountName: string;
    entries: JournalEntry[];
    totalDebit: number;
    totalCredit: number;
    balance: number;
}

export function GeneralLedger({ entries }: GeneralLedgerProps) {
    
    const ledgerAccounts = useMemo(() => {
        const grouped = entries.reduce((acc, entry) => {
            if (!acc[entry.accountNumber]) {
                acc[entry.accountNumber] = [];
            }
            acc[entry.accountNumber].push(entry);
            return acc;
        }, {} as Record<number, JournalEntry[]>);

        return Object.entries(grouped).map(([accountNumberStr, accountEntries]) => {
            const accountNumber = parseInt(accountNumberStr, 10);
            const accountInfo = syscohadaChartOfAccounts.find(acc => acc.accountNumber === accountNumber);
            let runningBalance = 0;

            const sortedEntries = accountEntries
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map(entry => {
                    const debit = entry.debit || 0;
                    const credit = entry.credit || 0;
                    if (accountInfo?.type === "Débit") {
                        runningBalance += debit - credit;
                    } else {
                        runningBalance += credit - debit;
                    }
                    return { ...entry, balance: runningBalance };
                });
            
            const totalDebit = sortedEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
            const totalCredit = sortedEntries.reduce((sum, e) => sum + (e.credit || 0), 0);

            return {
                accountNumber,
                accountName: accountInfo?.accountName || "Compte Inconnu",
                entries: sortedEntries,
                totalDebit,
                totalCredit,
                balance: runningBalance
            };
        }).sort((a,b) => a.accountNumber - b.accountNumber);

    }, [entries]);

    return (
         <Card>
            <CardHeader>
                <CardTitle>Grand Livre</CardTitle>
                <CardDescription>
                    Consultez le détail des mouvements pour chaque compte.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {ledgerAccounts.length > 0 ? (
                    ledgerAccounts.map(account => (
                        <div key={account.accountNumber} className="rounded-md border">
                             <h3 className="text-lg font-semibold p-4 bg-muted/50">{account.accountNumber} - {account.accountName}</h3>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Date</TableHead>
                                        <TableHead>Libellé</TableHead>
                                        <TableHead className="text-right w-[120px]">Débit</TableHead>
                                        <TableHead className="text-right w-[120px]">Crédit</TableHead>
                                        <TableHead className="text-right w-[120px]">Solde</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {account.entries.map((entry: any) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>{format(entry.date, "dd/MM/yyyy")}</TableCell>
                                            <TableCell>{entry.description}</TableCell>
                                            <TableCell className="text-right">{entry.debit?.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">{entry.credit?.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-medium">{entry.balance?.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                     <TableRow className="bg-muted/50 font-bold">
                                        <TableCell colSpan={2}>Total Mouvements</TableCell>
                                        <TableCell className="text-right">{account.totalDebit.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{account.totalCredit.toLocaleString()}</TableCell>
                                        <TableCell />
                                    </TableRow>
                                    <TableRow className="bg-card font-bold text-lg">
                                        <TableCell colSpan={4} className={cn("text-right", account.balance >= 0 ? "text-green-500" : "text-red-500")}>
                                            Solde Final
                                        </TableCell>
                                        <TableCell className={cn("text-right", account.balance >= 0 ? "text-green-500" : "text-red-500")}>
                                            {account.balance.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                             </Table>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Aucune écriture enregistrée pour générer le grand livre.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

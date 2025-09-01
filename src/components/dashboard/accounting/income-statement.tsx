// src/components/dashboard/accounting/income-statement.tsx
"use client";

import { useMemo } from "react";
import type { JournalEntry } from "./journal-entries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface IncomeStatementProps {
    entries: JournalEntry[];
}

interface IncomeStatementLine {
    label: string;
    amount: number;
    isSubtotal?: boolean;
    isTotal?: boolean;
    indent?: boolean;
}

export function IncomeStatement({ entries }: IncomeStatementProps) {

    const incomeStatementData = useMemo(() => {
        const calculateTotal = (accountPrefix: number | number[]) => {
            const prefixes = Array.isArray(accountPrefix) ? accountPrefix : [accountPrefix];
            return entries
                .filter(e => prefixes.some(p => e.accountNumber.toString().startsWith(p.toString())))
                .reduce((sum, e) => sum + (e.credit || 0) - (e.debit || 0), 0);
        };
        
        const sales = calculateTotal(70);
        const operatingSubsidies = calculateTotal(71);
        const otherOperatingIncome = calculateTotal([72, 73, 74, 75]);
        const totalOperatingIncome = sales + operatingSubsidies + otherOperatingIncome;
        
        const purchases = calculateTotal(60);
        const externalServices = calculateTotal([61, 62]);
        const personnelExpenses = calculateTotal(64);
        const taxes = calculateTotal(63);
        const otherCharges = calculateTotal(65);
        const depreciation = calculateTotal(68);
        const totalOperatingExpenses = purchases + externalServices + personnelExpenses + taxes + otherCharges + depreciation;
        
        const operatingResult = totalOperatingIncome - totalOperatingExpenses;
        
        const financialIncome = calculateTotal(77);
        const financialExpenses = calculateTotal(67);
        const financialResult = financialIncome - financialExpenses;
        
        const ordinaryActivitiesResult = operatingResult + financialResult;
        
        // Simplified for now, would require more detail for real-world scenarios
        const extraordinaryResult = calculateTotal([81, 83, 85, 89]) - calculateTotal([82, 84, 86]);
        const incomeTax = calculateTotal(87);

        const netResult = ordinaryActivitiesResult + extraordinaryResult - incomeTax;
        
        const lines: IncomeStatementLine[] = [
            { label: "Ventes et produits assimilés (Cpt. 70)", amount: sales, indent: true },
            { label: "Subventions d'exploitation (Cpt. 71)", amount: operatingSubsidies, indent: true },
            { label: "Autres produits (Cpt. 72-75)", amount: otherOperatingIncome, indent: true },
            { label: "Total des Produits d'Exploitation", amount: totalOperatingIncome, isSubtotal: true },
            
            { label: "Achats et variations de stock (Cpt. 60)", amount: purchases, indent: true },
            { label: "Services extérieurs et autres consommations (Cpt. 61, 62)", amount: externalServices, indent: true },
            { label: "Charges de personnel (Cpt. 64)", amount: personnelExpenses, indent: true },
            { label: "Impôts et taxes (Cpt. 63)", amount: taxes, indent: true },
            { label: "Autres charges (Cpt. 65)", amount: otherCharges, indent: true },
            { label: "Dotations aux amortissements et provisions (Cpt. 68)", amount: depreciation, indent: true },
            { label: "Total des Charges d'Exploitation", amount: totalOperatingExpenses, isSubtotal: true },
            
            { label: "Résultat d'Exploitation", amount: operatingResult, isSubtotal: true },
            
            { label: "Produits financiers (Cpt. 77)", amount: financialIncome, indent: true },
            { label: "Charges financières (Cpt. 67)", amount: financialExpenses, indent: true },
            { label: "Résultat Financier", amount: financialResult, isSubtotal: true },
            
            { label: "Résultat des activités ordinaires", amount: ordinaryActivitiesResult, isSubtotal: true },
            
            // Simplified extraordinary items and tax
            { label: "Résultat hors activités ordinaires (Cpt. 8...)", amount: extraordinaryResult, isSubtotal: true },
            { label: "Impôts sur les bénéfices (Cpt. 87)", amount: incomeTax, isSubtotal: true },

            { label: "Résultat Net de l'exercice", amount: netResult, isTotal: true },
        ];

        return lines;

    }, [entries]);

    return (
         <Card>
            <CardHeader>
                <CardTitle>Compte de Résultat</CardTitle>
                <CardDescription>
                    Synthèse des charges et des produits de l'exercice.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Libellé</TableHead>
                                <TableHead className="text-right w-[150px]">Montant</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {incomeStatementData.length > 0 ? (
                                incomeStatementData.map((line, index) => (
                                    <TableRow key={index} className={cn(line.isSubtotal && "bg-muted/50 font-semibold", line.isTotal && "bg-primary/10 text-primary font-bold text-lg")}>
                                        <TableCell className={cn(line.indent && "pl-8")}>{line.label}</TableCell>
                                        <TableCell className={cn("text-right", line.amount < 0 && "text-destructive")}>
                                            {line.amount.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="h-24 text-center">
                                        Aucune écriture pour générer le compte de résultat.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

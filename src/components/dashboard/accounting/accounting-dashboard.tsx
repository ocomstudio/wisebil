
// src/components/dashboard/accounting/accounting-dashboard.tsx
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, FileText } from "lucide-react";
import type { JournalEntry } from "@/context/accounting-context";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface AccountingDashboardProps {
    entries: JournalEntry[];
}

export function AccountingDashboard({ entries }: AccountingDashboardProps) {
    const { totalRevenue, totalExpenses, netResult } = useMemo(() => {
        let revenue = 0;
        let expenses = 0;
        
        entries.forEach(entry => {
            const classCode = Math.floor(entry.accountNumber / 1000);
            if (classCode === 7) { // Classe 7 : Produits
                revenue += entry.credit || 0;
                revenue -= entry.debit || 0;
            } else if (classCode === 6) { // Classe 6 : Charges
                expenses += entry.debit || 0;
                expenses -= entry.credit || 0;
            }
        });
        
        return {
            totalRevenue: revenue,
            totalExpenses: expenses,
            netResult: revenue - expenses,
        };
    }, [entries]);

    const expensesByAccount = useMemo(() => {
         const expenses = entries.filter(e => Math.floor(e.accountNumber / 1000) === 6);
         const grouped = expenses.reduce((acc, entry) => {
            if (!acc[entry.accountName]) {
                acc[entry.accountName] = 0;
            }
            acc[entry.accountName] += (entry.debit || 0) - (entry.credit || 0);
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped)
            .map(([name, total]) => ({ name, total }))
            .sort((a,b) => b.total - a.total);

    }, [entries]);
    
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total des produits (Classe 7)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total des Charges</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalExpenses.toLocaleString()}</div>
                         <p className="text-xs text-muted-foreground">Total des charges (Classe 6)</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Résultat Net</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netResult >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {netResult.toLocaleString()}
                        </div>
                         <p className="text-xs text-muted-foreground">Différence entre produits et charges</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Écritures</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{entries.length}</div>
                         <p className="text-xs text-muted-foreground">Nombre d'écritures enregistrées</p>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Répartition des Charges</CardTitle>
                    <CardDescription>Visualisation des principaux postes de dépenses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={expensesByAccount}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                angle={-45}
                                textAnchor="end"
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${Number(value) / 1000}k`}
                            />
                             <Tooltip 
                                cursor={{fill: 'hsl(var(--muted))'}}
                                contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}
                             />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

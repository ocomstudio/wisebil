// src/app/dashboard/reports/page.tsx
"use client"
import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTransactions } from "@/context/transactions-context";

const chartConfig = {
  amount: {
    label: "Dépenses",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function ReportsPage() {
  const { transactions, expenses: totalExpenses } = useTransactions();

  const { chartData, topExpenses } = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    if (expenseTransactions.length === 0) {
      return { chartData: [], topExpenses: [] };
    }

    const expensesByCategory = expenseTransactions.reduce((acc, transaction) => {
      const category = transaction.category || "Autre";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(expensesByCategory).map(([name, amount]) => ({
      name,
      amount,
    })).sort((a, b) => b.amount - a.amount);

    const topExpenses = chartData.slice(0, 5).map(expense => ({
      ...expense,
      percentage: totalExpenses > 0 ? ((expense.amount / totalExpenses) * 100).toFixed(0) : 0,
    }));
    
    return { chartData, topExpenses };
  }, [transactions, totalExpenses]);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h1 className="text-3xl font-bold font-headline">Statistiques</h1>
         <Select defaultValue="monthly">
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="daily">Journalier</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuel</SelectItem>
                <SelectItem value="yearly">Annuel</SelectItem>
            </SelectContent>
        </Select>
       </div>

      <Card>
        <CardHeader>
          <CardTitle>Aperçu des Dépenses</CardTitle>
           {chartData.length === 0 ? (
            <CardDescription>Aucune dépense enregistrée pour le moment.</CardDescription>
          ) : (
            <CardDescription>Vos dépenses totales par catégorie.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
             {chartData.length > 0 ? (
                <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        className="text-xs"
                        interval={0}
                        width={80} 
                        tick={{
                            overflow: 'visible',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                        }}
                    />
                    <XAxis
                        type="number"
                        dataKey="amount"
                        tickFormatter={(value) => `${value / 1000}k`}
                        hide
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="amount" fill="var(--color-amount)" radius={4} barSize={20} />
                </BarChart>
             ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    Aucune donnée de graphique disponible.
                </div>
             )}
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Top des Dépenses</CardTitle>
           <CardDescription>Vos catégories de dépenses les plus importantes ce mois-ci.</CardDescription>
        </CardHeader>
        <CardContent>
            {topExpenses.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Catégorie</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                            <TableHead className="text-right">Pourcentage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topExpenses.map((expense) => (
                            <TableRow key={expense.name}>
                                <TableCell className="font-medium">{expense.name}</TableCell>
                                <TableCell className="text-right">{expense.amount.toLocaleString('fr-FR')} FCFA</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="secondary">{expense.percentage}%</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                 <div className="flex h-24 w-full items-center justify-center text-muted-foreground">
                    Aucune dépense enregistrée.
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
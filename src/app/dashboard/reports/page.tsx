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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions } from "@/context/transactions-context";
import { ArrowLeft, Settings, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { allCategories } from "@/config/categories";
import { FinancialSummaryCard } from "@/components/dashboard/financial-summary-card";
import { useSettings } from "@/context/settings-context";


const chartConfig = {
  amount: {
    label: "Dépenses",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const COLORS = ["#50C878", "#FF8042", "#FFBB28", "#0088FE", "#AF19FF"];

export default function ReportsPage() {
  const { transactions, income, expenses } = useTransactions();
  const { settings } = useSettings();
  const isVisible = !settings.isBalanceHidden;

  const getCategoryEmoji = (categoryName?: string) => {
    if (!categoryName) return '💸';
    const category = allCategories.find(c => c.name === categoryName);
    return category ? category.emoji : '💸';
  }

  const { chartData, pieChartData, topCategoryEmoji } = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    if (expenseTransactions.length === 0) {
      return { chartData: [], pieChartData: [], topCategoryEmoji: '📊' };
    }

    const expensesByCategory = expenseTransactions.reduce((acc, transaction) => {
      const category = transaction.category || "Autre";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const sortedChartData = Object.entries(expensesByCategory).map(([name, amount]) => ({
      name,
      amount,
    })).sort((a, b) => b.amount - a.amount);

     const pieChartData = sortedChartData.map((item) => ({
      name: item.name,
      value: item.amount,
    }));
    
    const topCategoryEmoji = sortedChartData.length > 0 ? getCategoryEmoji(sortedChartData[0]?.name) : '📊';

    return { chartData: sortedChartData, pieChartData, topCategoryEmoji };
  }, [transactions]);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between md:hidden">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-lg font-bold">Statistiques</h1>
          <Button variant="ghost" size="icon">
            <Settings />
          </Button>
        </div>

       <div className="hidden md:flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
         <h1 className="text-3xl font-bold font-headline">Statistiques</h1>
         <Select defaultValue="monthly">
            <SelectTrigger className="w-full sm:w-[180px]">
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
            <CardContent className="p-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-green-500/20 p-2 rounded-full">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Revenus</p>
                        <p className="font-bold text-lg">{isVisible ? `${income.toLocaleString('fr-FR')} FCFA` : '******'}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="bg-red-500/20 p-2 rounded-full">
                        <TrendingDown className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Dépenses</p>
                        <p className="font-bold text-lg">{isVisible ? `${expenses.toLocaleString('fr-FR')} FCFA` : '******'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <FinancialSummaryCard income={income} expenses={expenses} chartData={chartData} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Aperçu des Dépenses</CardTitle>
                  {chartData.length === 0 ? (
                    <CardDescription>Aucune dépense enregistrée.</CardDescription>
                  ) : (
                    <CardDescription>Ce mois-ci</CardDescription>
                  )}
                </div>
                <Select defaultValue="monthly">
                    <SelectTrigger className="w-[130px] hidden md:flex">
                        <SelectValue placeholder="Filtrer" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="yearly">Annuel</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                 {chartData.length > 0 ? (
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 0, bottom: 40, left: -20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            tick={{ fontSize: 10 }}
                            className="hidden sm:block"
                        />
                         <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tick={{ fontSize: 10 }}
                             className="sm:hidden"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => isVisible ? `${Number(value) / 1000}k` : '***'}
                            tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" formatter={(value, name) => isVisible ? `${Number(value).toLocaleString('fr-FR')} FCFA` : '******'} />}
                        />
                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={8} />
                    </BarChart>
                 ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground min-h-[250px]">
                        Aucune donnée de graphique disponible.
                    </div>
                 )}
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Répartition par catégorie</CardTitle>
               <CardDescription>Vos dépenses ce mois-ci.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
                {pieChartData.length > 0 ? (
                     <ChartContainer config={chartConfig} className="min-h-[250px] w-full aspect-square">
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel formatter={(value, name) => isVisible ? `${name}: ${Number(value).toLocaleString('fr-FR')} FCFA` : `${name}: ******`} />}
                            />
                            <Pie
                                data={pieChartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius="60%"
                                outerRadius="80%"
                                strokeWidth={5}
                            >
                                <text
                                    x="50%"
                                    y="50%"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="2.5rem"
                                >
                                    {topCategoryEmoji}
                                </text>
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                ) : (
                     <div className="flex h-48 w-full items-center justify-center text-muted-foreground">
                        Aucune dépense enregistrée.
                    </div>
                )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

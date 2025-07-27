// src/app/dashboard/reports/page.tsx
"use client"
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

const chartData = [
  { month: "Janvier", desktop: 186 },
  { month: "Février", desktop: 305 },
  { month: "Mars", desktop: 237 },
  { month: "Avril", desktop: 73 },
  { month: "Mai", desktop: 209 },
  { month: "Juin", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Dépenses",
    color: "hsl(var(--primary))",
  },
};

const topExpenses = [
    { name: "Shopping", amount: 45000, percentage: 35 },
    { name: "Restaurant", amount: 30000, percentage: 25 },
    { name: "Transport", amount: 20000, percentage: 15 },
    { name: "Factures", amount: 15000, percentage: 10 },
    { name: "Autres", amount: 10000, percentage: 5 },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h1 className="text-3xl font-bold font-headline">Statistiques</h1>
         <Select defaultValue="monthly">
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter" />
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
          <CardDescription>Janvier - Juin 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Top des Dépenses</CardTitle>
           <CardDescription>Vos catégories de dépenses les plus importantes ce mois-ci.</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}

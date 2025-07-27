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

const chartData: any[] = [];
const topExpenses: any[] = [];

const chartConfig = {
  desktop: {
    label: "Dépenses",
    color: "hsl(var(--primary))",
  },
};

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
          <CardDescription>Aucune donnée pour le moment</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
             {chartData.length > 0 ? (
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

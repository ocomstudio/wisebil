// src/components/charts/pie-chart-component.tsx
"use client";
import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";
import { useLocale } from '@/context/locale-context';
import { useSettings } from '@/context/settings-context';

const COLORS = ["#50C878", "#FF8042", "#FFBB28", "#0088FE", "#AF19FF"];

interface PieChartComponentProps {
    pieChartData: { name: string; value: number; }[];
    topCategoryEmoji: string;
}

export function PieChartComponent({ pieChartData, topCategoryEmoji }: PieChartComponentProps) {
    const { t, formatCurrency } = useLocale();
    const { settings, isTemporarilyVisible } = useSettings();
    const isVisible = !settings.isBalanceHidden || isTemporarilyVisible;

    const chartConfig = {
      amount: {
        label: t('expenses'),
        color: "hsl(var(--primary))",
      },
    } satisfies ChartConfig;

    if (pieChartData.length === 0) {
        return (
            <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
                {t('no_expenses_recorded')}
            </div>
        );
    }
    
    return (
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel formatter={(value, name) => isVisible ? `${name}: ${formatCurrency(Number(value))}` : `${name}: ******`} />}
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
    );
}

// src/components/charts/bar-chart-component.tsx
"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";
import { useLocale } from '@/context/locale-context';
import { useSettings } from '@/context/settings-context';

interface BarChartComponentProps {
    chartData: { name: string; amount: number; }[];
}

export function BarChartComponent({ chartData }: BarChartComponentProps) {
  const { t, formatCurrency } = useLocale();
  const { settings, isTemporarilyVisible } = useSettings();
  const isVisible = !settings.isBalanceHidden || isTemporarilyVisible;

  const chartConfig = {
    amount: {
      label: t('expenses'),
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  if (chartData.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground min-h-[250px]">
        {t('no_chart_data')}
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
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
          tickFormatter={(value) => isVisible ? `${Number(value) / 1000}k` : '******'}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" formatter={(value) => isVisible ? formatCurrency(Number(value)) : '******'} />}
        />
        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={8} />
      </BarChart>
    </ChartContainer>
  );
}

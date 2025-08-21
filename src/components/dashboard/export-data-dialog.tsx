// src/components/dashboard/export-data-dialog.tsx
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTransactions } from "@/context/transactions-context";
import { useBudgets } from "@/context/budget-context";
import { useSavings } from "@/context/savings-context";
import { useLocale } from "@/context/locale-context";
import { Download, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Label } from "../ui/label";

const exportSchema = z.object({
    dataTypes: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one data type to export.",
    }),
    dateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
    }).optional(),
});

type ExportFormValues = z.infer<typeof exportSchema>;

export function ExportDataDialog() {
    const { t, formatDate } = useLocale();
    const { transactions } = useTransactions();
    const { budgets } = useBudgets();
    const { savingsGoals } = useSavings();
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const form = useForm<ExportFormValues>({
        resolver: zodResolver(exportSchema),
        defaultValues: {
            dataTypes: ["transactions", "budgets", "savingsGoals"],
            dateRange: { from: undefined, to: undefined },
        },
    });

    const dataItems = [
        { id: "transactions", label: t('transactions') },
        { id: "budgets", label: t('nav_budgets') },
        { id: "savingsGoals", label: t('nav_savings') },
    ];

    const onSubmit = (data: ExportFormValues) => {
        setIsExporting(true);

        const { from, to } = data.dateRange || {};
        const wb = XLSX.utils.book_new();

        // Filter data based on date range if provided
        const filterByDate = (items: any[]) => {
            if (!from || !to || !items.every(item => item.date)) return items;
            return items.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= from && itemDate <= to;
            });
        };

        if (data.dataTypes.includes("transactions")) {
            const filteredTransactions = filterByDate(transactions);
            const sheetData = filteredTransactions.map(tx => ({
                Date: formatDate(tx.date),
                Description: tx.description,
                Type: tx.type,
                Amount: tx.amount,
                Category: tx.category,
            }));
            const ws = XLSX.utils.json_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        }

        if (data.dataTypes.includes("budgets")) {
            const sheetData = budgets.map(b => ({
                Name: b.name,
                Amount: b.amount,
                Category: b.category,
            }));
            const ws = XLSX.utils.json_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(wb, ws, "Budgets");
        }

        if (data.dataTypes.includes("savingsGoals")) {
            const sheetData = savingsGoals.map(sg => ({
                Name: sg.name,
                "Target Amount": sg.targetAmount,
                "Current Amount": sg.currentAmount,
                Emoji: sg.emoji,
            }));
            const ws = XLSX.utils.json_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(wb, ws, "Savings Goals");
        }

        const fileName = `Wisebil_Export_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
        XLSX.writeFile(wb, fileName);

        setIsExporting(false);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    {t('export_data_button')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('data_export_title')}</DialogTitle>
                    <DialogDescription>{t('export_dialog_desc')}</DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <Label className="font-semibold">{t('data_to_export_label')}</Label>
                        <div className="space-y-2 mt-2">
                             <Controller
                                control={form.control}
                                name="dataTypes"
                                render={({ field }) => (
                                    <>
                                        {dataItems.map((item) => (
                                            <div key={item.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={item.id}
                                                    checked={field.value?.includes(item.id)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), item.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== item.id
                                                                )
                                                            );
                                                    }}
                                                />
                                                <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    {item.label}
                                                </label>
                                            </div>
                                        ))}
                                    </>
                                )}
                            />
                        </div>
                         {form.formState.errors.dataTypes && (
                            <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.dataTypes.message}</p>
                        )}
                    </div>
                    
                    <div>
                        <Label className="font-semibold">{t('date_range_label')}</Label>
                        <Controller
                            control={form.control}
                            name="dateRange"
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className="w-full justify-start text-left font-normal mt-2"
                                        >
                                            {field.value?.from ? (
                                                field.value.to ? (
                                                    <>
                                                        {format(field.value.from, "LLL dd, y")} -{" "}
                                                        {format(field.value.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(field.value.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>{t('pick_a_date_range')}</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="range"
                                            defaultMonth={field.value?.from}
                                            selected={field.value as DateRange}
                                            onSelect={field.onChange}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                         <p className="text-xs text-muted-foreground mt-1">{t('date_range_helper')}</p>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isExporting}>
                            {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('export_button')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

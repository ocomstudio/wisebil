
// src/components/dashboard/accounting/journal-entries.tsx
"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, CalendarIcon, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { syscohadaChartOfAccounts, type Account } from "@/config/chart-of-accounts-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface JournalEntry {
    id: string;
    date: Date;
    accountNumber: number;
    accountName: string;
    description: string;
    debit?: number;
    credit?: number;
}

const entrySchema = z.object({
  date: z.date(),
  description: z.string().min(3, "La description est requise."),
  entries: z.array(z.object({
    accountNumber: z.coerce.number().min(1, "Veuillez sélectionner un compte."),
    debit: z.coerce.number().optional().default(0),
    credit: z.coerce.number().optional().default(0),
  })).min(2, "Au moins deux lignes sont requises.")
}).refine(data => {
    const totalDebit = data.entries.reduce((acc, entry) => acc + (entry.debit || 0), 0);
    const totalCredit = data.entries.reduce((acc, entry) => acc + (entry.credit || 0), 0);
    // Use a small tolerance for floating point comparison
    return Math.abs(totalDebit - totalCredit) < 0.001;
}, {
    message: "Le total des débits doit être égal au total des crédits.",
    path: ["entries"],
});

interface JournalEntriesProps {
    entries: JournalEntry[];
    setEntries: (entries: JournalEntry[]) => void;
}

export function JournalEntries({ entries, setEntries }: JournalEntriesProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof entrySchema>>({
        resolver: zodResolver(entrySchema),
        defaultValues: {
            date: new Date(),
            description: "",
            entries: [{accountNumber: 0, debit: 0, credit: 0}, {accountNumber: 0, debit: 0, credit: 0}]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "entries",
    });

    const onSubmit = (values: z.infer<typeof entrySchema>) => {
        const newEntries: JournalEntry[] = values.entries
            .filter(e => e.accountNumber > 0 && (e.debit || e.credit))
            .map(entry => {
                const account = syscohadaChartOfAccounts.find(acc => acc.accountNumber === entry.accountNumber);
                return {
                    id: uuidv4(),
                    date: values.date,
                    description: values.description,
                    accountNumber: entry.accountNumber,
                    accountName: account?.accountName || 'Compte inconnu',
                    debit: entry.debit || 0,
                    credit: entry.credit || 0,
                };
            });

        setEntries(newEntries);
        toast({
            title: "Écriture ajoutée",
            description: "La nouvelle écriture de journal a été enregistrée.",
        });
        setIsDialogOpen(false);
        form.reset({
            date: new Date(),
            description: "",
            entries: [{accountNumber: 0, debit: 0, credit: 0}, {accountNumber: 0, debit: 0, credit: 0}]
        });
    };
    
    const filteredEntries = useMemo(() => entries.filter(entry => 
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.accountNumber.toString().includes(searchTerm)
    ), [entries, searchTerm]);

    const { totalDebit, totalCredit } = useMemo(() => {
        return form.getValues().entries.reduce((acc, entry) => {
            acc.totalDebit += entry.debit || 0;
            acc.totalCredit += entry.credit || 0;
            return acc;
        }, { totalDebit: 0, totalCredit: 0 });
    }, [form.watch('entries')]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Journal des Écritures</CardTitle>
                <CardDescription>
                    Enregistrez et consultez toutes vos écritures comptables.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-4 gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher une écriture..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nouvelle Écriture
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Créer une nouvelle écriture</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                     <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                <FormLabel>Date de l'écriture</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                        >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Choisissez une date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Libellé de l'opération</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Achat de fournitures" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                     </div>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-[1fr_120px_120px_auto] gap-2 items-center font-medium text-sm text-muted-foreground px-1">
                                            <p>Compte</p>
                                            <p className="text-right">Débit</p>
                                            <p className="text-right">Crédit</p>
                                            <div/>
                                        </div>
                                        {fields.map((item, index) => (
                                            <div key={item.id} className="grid grid-cols-[1fr_120px_120px_auto] gap-2 items-center">
                                                <FormField
                                                    control={form.control}
                                                    name={`entries.${index}.accountNumber`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                           <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant="outline"
                                                                            role="combobox"
                                                                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                                        >
                                                                            {field.value && field.value > 0
                                                                                ? `${field.value} - ${syscohadaChartOfAccounts.find(acc => acc.accountNumber === field.value)?.accountName}`
                                                                                : "Choisir un compte"}
                                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-[400px] p-0">
                                                                    <Command>
                                                                        <CommandInput placeholder="Rechercher un compte..." />
                                                                        <CommandEmpty>Aucun compte trouvé.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {syscohadaChartOfAccounts.map(acc => (
                                                                                <CommandItem
                                                                                    value={`${acc.accountNumber} - ${acc.accountName}`}
                                                                                    key={acc.accountNumber}
                                                                                    onSelect={() => {
                                                                                        form.setValue(`entries.${index}.accountNumber`, acc.accountNumber)
                                                                                    }}
                                                                                >
                                                                                    <Check className={cn("mr-2 h-4 w-4", acc.accountNumber === field.value ? "opacity-100" : "opacity-0")} />
                                                                                    {acc.accountNumber} - {acc.accountName}
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </Command>
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`entries.${index}.debit`}
                                                    render={({ field }) => (
                                                        <FormItem><FormControl><Input type="number" placeholder="0.00" {...field} className="text-right" /></FormControl></FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`entries.${index}.credit`}
                                                    render={({ field }) => (
                                                        <FormItem><FormControl><Input type="number" placeholder="0.00" {...field} className="text-right" /></FormControl></FormItem>
                                                    )}
                                                />
                                                 <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="grid grid-cols-[1fr_120px_120px_auto] gap-2 items-center font-medium text-right border-t pt-2">
                                        <p>Total</p>
                                        <p>{totalDebit.toLocaleString()}</p>
                                        <p className={cn(totalCredit !== totalDebit && "text-destructive")}>{totalCredit.toLocaleString()}</p>
                                        <div />
                                    </div>
                                    
                                    <FormMessage>{form.formState.errors.entries?.root?.message}</FormMessage>

                                    <Button type="button" variant="outline" size="sm" onClick={() => append({accountNumber: 0, debit: 0, credit: 0})}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Ajouter une ligne
                                    </Button>

                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="ghost">Annuler</Button>
                                        </DialogClose>
                                        <Button type="submit">Enregistrer</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Date</TableHead>
                                <TableHead className="w-[120px]">Compte</TableHead>
                                <TableHead>Libellé</TableHead>
                                <TableHead className="text-right w-[120px]">Débit</TableHead>
                                <TableHead className="text-right w-[120px]">Crédit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEntries.length > 0 ? (
                                filteredEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{format(entry.date, "dd/MM/yyyy")}</TableCell>
                                        <TableCell className="font-medium">{entry.accountNumber}</TableCell>
                                        <TableCell>{entry.description}</TableCell>
                                        <TableCell className="text-right">{entry.debit?.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{entry.credit?.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Aucune écriture enregistrée.
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

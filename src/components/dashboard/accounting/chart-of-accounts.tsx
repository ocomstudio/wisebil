// src/components/dashboard/accounting/chart-of-accounts.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const accountSchema = z.object({
  accountNumber: z.coerce
    .number()
    .min(1000, "Le numéro de compte doit avoir au moins 4 chiffres."),
  accountName: z.string().min(3, "Le libellé est requis."),
  type: z.enum(["Débit", "Crédit"]),
});

export function ChartOfAccounts() {
    const [searchTerm, setSearchTerm] = useState("");
    const [accounts, setAccounts] = useState<Account[]>(syscohadaChartOfAccounts);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof accountSchema>>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            accountName: "",
            type: "Débit",
        },
    });

    const onSubmit = (values: z.infer<typeof accountSchema>) => {
        const newAccount: Account = {
            ...values,
            class: Math.floor(values.accountNumber / 1000),
        };
        setAccounts(prev => [...prev, newAccount].sort((a, b) => a.accountNumber - b.accountNumber));
        toast({
            title: "Compte ajouté",
            description: `Le compte ${newAccount.accountNumber} - ${newAccount.accountName} a été ajouté.`,
        });
        setIsDialogOpen(false);
        form.reset();
    };

    const filteredAccounts = accounts.filter(account => 
        account.accountNumber.toString().includes(searchTerm) ||
        account.accountName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Plan Comptable SYSCOHADA</CardTitle>
                <CardDescription>
                    Parcourez et gérez les comptes de votre plan comptable.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-4 gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher par numéro ou nom de compte..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Ajouter un compte
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter un nouveau compte</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                    <FormField
                                        control={form.control}
                                        name="accountNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Numéro de compte</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Ex: 6011" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="accountName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Libellé du compte</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Achats de marchandises A" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="type"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Type</FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez un type" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              <SelectItem value="Débit">Débit</SelectItem>
                                              <SelectItem value="Crédit">Crédit</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="ghost">Annuler</Button>
                                        </DialogClose>
                                        <Button type="submit">Ajouter</Button>
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
                                <TableHead className="w-[120px]">Compte</TableHead>
                                <TableHead>Libellé</TableHead>
                                <TableHead className="w-[100px]">Classe</TableHead>
                                <TableHead className="text-right w-[120px]">Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAccounts.length > 0 ? (
                                filteredAccounts.map((account) => (
                                    <TableRow key={account.accountNumber}>
                                        <TableCell className="font-medium">{account.accountNumber}</TableCell>
                                        <TableCell>{account.accountName}</TableCell>
                                        <TableCell>{account.class}</TableCell>
                                        <TableCell className="text-right">{account.type}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Aucun compte trouvé.
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
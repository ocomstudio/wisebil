// src/components/dashboard/accounting/chart-of-accounts.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search } from "lucide-react";
import { syscohadaChartOfAccounts } from "@/config/chart-of-accounts-data";

export function ChartOfAccounts() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredAccounts = syscohadaChartOfAccounts.filter(account => 
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
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un compte
                    </Button>
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

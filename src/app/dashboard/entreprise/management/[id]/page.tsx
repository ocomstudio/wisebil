// src/app/dashboard/entreprise/management/[id]/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/context/locale-context";
import { ArrowLeft, PlusCircle, Users, Loader2, MoreVertical, Trash2, Search, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTeamChat } from "@/context/team-chat-context";
import type { TeamMember } from "@/context/team-chat-context";
import { useEnterprise } from "@/context/enterprise-context";
import type { Enterprise } from "@/types/enterprise";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@/types/transaction";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TeamManagementPage() {
    const { t, formatCurrency } = useLocale();
    const router = useRouter();
    const params = useParams();
    const { enterprises, isLoading: isLoadingEnterprises, sendInvitation } = useEnterprise();
    const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const { setSelectedMember } = useTeamChat();
    const { toast } = useToast();
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

    const id = params.id as string;
    
    useEffect(() => {
        if (!id) return;
        const enterpriseDocRef = doc(db, 'enterprises', id);
        const unsubscribe = onSnapshot(enterpriseDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const enterpriseData = { id: docSnap.id, ...docSnap.data() } as Enterprise;
                setEnterprise(enterpriseData);
                // The transactions are now stored inside the enterprise document.
                setTransactions(enterpriseData.transactions || []);
            } else {
                setEnterprise(null);
            }
            setIsLoadingTransactions(false);
        }, (error) => {
            console.error("Failed to listen to enterprise document:", error);
            setIsLoadingTransactions(false);
        });

        return () => unsubscribe();
    }, [id]);
    
    const { income, expenses } = useMemo(() => {
        if (!transactions) return { income: 0, expenses: 0 };
        return transactions.reduce((acc, tx) => {
            if (tx.type === 'income') {
                acc.income += tx.amount;
            } else {
                acc.expenses += tx.amount;
            }
            return acc;
        }, { income: 0, expenses: 0 });
    }, [transactions]);
    
    const addMemberSchema = z.object({
        email: z.string().email("Veuillez entrer une adresse e-mail valide."),
        role: z.string().min(2, "Le rôle est requis."),
    });
    type AddMemberFormValues = z.infer<typeof addMemberSchema>;

    const form = useForm<AddMemberFormValues>({
        resolver: zodResolver(addMemberSchema),
        defaultValues: { email: "", role: "" },
    });
    
    const onAddMemberSubmit = async (data: AddMemberFormValues) => {
        if (!enterprise) return;

        try {
            await sendInvitation(enterprise.id, data.email, data.role);
            toast({
                title: "Invitation envoyée",
                description: `Une invitation a été envoyée à ${data.email}.`,
            });
            setIsAddMemberOpen(false);
            form.reset();
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Erreur",
                description: error.message || "Impossible d'envoyer l'invitation.",
            });
        }
    };
    
    if (isLoadingEnterprises || isLoadingTransactions) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                 <div className="grid gap-6 lg:grid-cols-3">
                    <Skeleton className="lg:col-span-1 h-80 w-full" />
                    <Skeleton className="lg:col-span-2 h-80 w-full" />
                 </div>
            </div>
        )
    }

    if (!enterprise) {
        return (
             <div className="text-center">
                <h2 className="text-2xl font-bold">Entreprise non trouvée</h2>
                <p className="text-muted-foreground mt-2">L'entreprise que vous recherchez n'existe pas.</p>
                <Button onClick={() => router.back()} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>
            </div>
        )
    }

    const teamMembers = enterprise.members ? enterprise.members.map(member => ({
        id: member.uid,
        name: member.name,
        role: member.role,
        avatar: "", // Placeholder, you might want to store this in Firestore
        'data-ai-hint': "person avatar"
    })) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/entreprise">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold font-headline">Bienvenue - {enterprise.name}</h1>
                    <p className="text-muted-foreground">Suivez et gérez les finances de votre équipe.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(income, 'XOF')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dépenses Totales</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(expenses, 'XOF')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Membres de l'équipe</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamMembers.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Membres de l'équipe</CardTitle>
                        <CardDescription>Gérez les membres de votre équipe.</CardDescription>
                        <div className="relative pt-2">
                            <Search className="absolute left-2.5 top-4.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher un membre..." className="pl-8" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {teamMembers.map(member => (
                             <div key={member.id} className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-4 p-2 rounded-md w-full justify-start h-auto"
                                    onClick={() => setSelectedMember(member)}
                                >
                                    <Avatar>
                                        <AvatarImage src={member.avatar} data-ai-hint={member['data-ai-hint']} />
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                        <p className="font-semibold">{member.name}</p>
                                        <p className="text-sm text-muted-foreground">{member.role}</p>
                                    </div>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Retirer</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                             </div>
                        ))}
                        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full mt-4">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Inviter un membre
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Ajouter un membre à l'équipe</DialogTitle>
                                    <DialogDescription>
                                        L'utilisateur doit déjà avoir un compte Wisebil pour être invité.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onAddMemberSubmit)} className="space-y-4 py-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Adresse e-mail du membre</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="membre@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Rôle du membre</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Comptable" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" variant="ghost">Annuler</Button>
                                            </DialogClose>
                                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Envoyer l'invitation
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Transactions Récentes de l'Entreprise</CardTitle>
                        <CardDescription>Les dernières transactions enregistrées pour cette entreprise.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Membre</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Montant</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions && transactions.length > 0 ? (
                                    transactions.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-medium">{tx.member}</TableCell>
                                        <TableCell>{tx.description}</TableCell>
                                        <TableCell>
                                            <Badge variant={tx.type === 'income' ? 'default' : 'secondary'} className={cn(tx.type === 'income' && "bg-green-600/20 text-green-500 border-green-500/20", tx.type === 'expense' && "bg-red-600/10 text-red-500 border-red-500/20")}>
                                                {tx.type === 'income' ? 'Revenu' : 'Dépense'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={cn("text-right font-semibold", tx.type === 'income' ? 'text-green-500' : 'text-red-500')}>
                                            {formatCurrency(tx.amount, 'XOF')}
                                        </TableCell>
                                    </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Aucune transaction récente.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

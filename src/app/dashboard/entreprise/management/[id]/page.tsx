// src/app/dashboard/entreprise/management/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
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

export default function TeamManagementPage() {
    const { t, formatCurrency } = useLocale();
    const router = useRouter();
    const params = useParams();
    const { enterprises, isLoading: isLoadingEnterprises } = useEnterprise();
    const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const { selectedMember, setSelectedMember } = useTeamChat();
    const { toast } = useToast();

    const id = params.id as string;

    useEffect(() => {
        if (!isLoadingEnterprises && id) {
            const foundEnterprise = enterprises.find(e => e.id === id);
            setEnterprise(foundEnterprise || null);
        }
    }, [id, isLoadingEnterprises, enterprises]);
    
    // Données de simulation
    const recentTransactions = [
        { id: "1", member: "Alice Dupont", description: "Licence logiciel", amount: 15000, type: "expense" },
        { id: "2", member: "Bob Martin", description: "Publicité Facebook", amount: 75000, type: "expense" },
        { id: "3", member: "Ocomstudio", description: "Paiement Client X", amount: 550000, type: "income" },
        { id: "4", member: "Alice Dupont", description: "Abonnement Cloud", amount: 25000, type: "expense" },
    ];
    const totalIncome = 550000;
    const totalExpenses = 115000;


    const addMemberSchema = z.object({
        email: z.string().email("Veuillez entrer une adresse e-mail valide."),
    });
    type AddMemberFormValues = z.infer<typeof addMemberSchema>;

    const form = useForm<AddMemberFormValues>({
        resolver: zodResolver(addMemberSchema),
        defaultValues: { email: "" },
    });
    
    const onAddMemberSubmit = (data: AddMemberFormValues) => {
        console.log("Inviting member:", data.email);
        toast({
            title: "Invitation envoyée",
            description: `Une invitation a été envoyée à ${data.email}.`,
        });
        setIsAddMemberOpen(false);
        form.reset();
    };

    const handleSelectMember = (member: TeamMember) => {
        if (selectedMember && selectedMember.id === member.id) {
            setSelectedMember(null); // Deselect if clicking the same member
        } else {
            setSelectedMember(member);
        }
    };
    
    if (isLoadingEnterprises) {
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

    const teamMembers = enterprise.members.map(member => ({
        id: member.uid,
        name: member.name,
        role: member.role,
        avatar: "", // Placeholder, you might want to store this in Firestore
        'data-ai-hint': "person avatar"
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/entreprise">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold font-headline">{enterprise.name} - Dépenses</h1>
                    <p className="text-muted-foreground">Suivez et gérez les finances de votre équipe.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus Totaux (30j)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalIncome, 'XOF')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dépenses Totales (30j)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalExpenses, 'XOF')}</div>
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
                                    className={cn(
                                        "flex items-center gap-4 p-2 rounded-md w-full justify-start h-auto",
                                        selectedMember?.id === member.id && "bg-muted"
                                    )}
                                    onClick={() => handleSelectMember(member)}
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
                        <CardTitle>Transactions Récentes</CardTitle>
                        <CardDescription>Les dernières transactions enregistrées par votre équipe.</CardDescription>
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
                                {recentTransactions.map(tx => (
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
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// src/app/dashboard/team/management/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/context/locale-context";
import { ArrowLeft, DollarSign, PlusCircle, User, Users, Loader2 } from "lucide-react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";


export default function TeamManagementPage() {
    const { t, formatCurrency } = useLocale();
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const { toast } = useToast();

    // Données de simulation
    const teamMembers = [
        { name: "Alice Dupont", role: "Développeur", avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxldHVkaWFudHxlbnwwfHx8fDE3NTY1NjM2MzB8MA&ixlib=rb-4.1.0&q=80&w=1080", "data-ai-hint": "woman avatar" },
        { name: "Bob Martin", role: "Marketing", avatar: "https://images.unsplash.com/photo-1620477403960-4188fdd7cee0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyMHx8RCVDMyVBOXZlbG9wcGV1cnxlbnwwfHx8fDE3NTY1NjM1MDd8MA&ixlib=rb-4.1.0&q=80&w=1080", "data-ai-hint": "man avatar" },
    ];
    const recentExpenses = [
        { id: "1", member: "Alice Dupont", description: "Licence logiciel", amount: 15000 },
        { id: "2", member: "Bob Martin", description: "Publicité Facebook", amount: 75000 },
        { id: "3", member: "Alice Dupont", description: "Abonnement Cloud", amount: 25000 },
    ];

    const addMemberSchema = z.object({
        email: z.string().email("Veuillez entrer une adresse e-mail valide."),
    });

    type AddMemberFormValues = z.infer<typeof addMemberSchema>;

    const form = useForm<AddMemberFormValues>({
        resolver: zodResolver(addMemberSchema),
        defaultValues: {
            email: "",
        },
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

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/entreprise">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                </Button>
                 <div className="flex-1">
                    <h1 className="text-3xl font-bold font-headline">Ocomstudio - Dépenses</h1>
                    <p className="text-muted-foreground">Suivez et gérez les dépenses de votre équipe.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dépenses totales (30j)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(115000, 'XOF')}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Membres de l'équipe</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Membres de l'équipe</CardTitle>
                            <CardDescription>Gérez les membres de votre équipe.</CardDescription>
                        </div>
                         <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Ajouter un membre
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
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-4">
                         {teamMembers.map(member => (
                             <div key={member.name} className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={member.avatar} data-ai-hint={member['data-ai-hint']} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.role}</p>
                                </div>
                             </div>
                         ))}
                       </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Dépenses Récentes</CardTitle>
                         <CardDescription>Les dernières dépenses enregistrées par votre équipe.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Membre</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Montant</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentExpenses.map(expense => (
                                <TableRow key={expense.id}>
                                    <TableCell className="font-medium">{expense.member}</TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(expense.amount, 'XOF')}</TableCell>
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

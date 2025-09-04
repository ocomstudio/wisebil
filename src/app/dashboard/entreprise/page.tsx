// src/app/dashboard/entreprise/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight, PlusCircle, Trash2, Settings } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Simulation de données pour les entreprises
const userEnterprises = [
  { id: "1", name: "Ocomstudio", role: "Propriétaire" },
  { id: "2", name: "Projet Alpha", role: "Manager" },
];


export default function EntrepriseHubPage() {
  const { t } = useLocale();

  return (
     <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Espace Entreprise</h1>
        <Button asChild>
            <Link href="/dashboard/entreprise/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer une entreprise
            </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Vos Entreprises</CardTitle>
            <CardDescription>Sélectionnez une entreprise pour gérer son équipe et ses finances.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
            {userEnterprises.map((enterprise) => (
                 <Card key={enterprise.id} className="hover:border-primary/50 hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg">{enterprise.name}</CardTitle>
                            <CardDescription>{enterprise.role}</CardDescription>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Briefcase className="h-6 w-6 text-primary"/>
                        </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <Button asChild>
                            <Link href="/dashboard/team/management">
                                Gérer <ArrowRight className="ml-2 h-4 w-4"/>
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Supprimer
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Voulez-vous vraiment supprimer "{enterprise.name}" ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Cette action est irréversible. Toutes les données associées à cette entreprise, y compris les équipes, les transactions et les conversations, seront définitivement supprimées.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                                            Oui, supprimer
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardContent>
                </Card>
            ))}
             <Card className="border-dashed flex flex-col items-center justify-center text-center p-6">
                <CardHeader>
                    <CardTitle className="text-muted-foreground">Rejoindre une entreprise</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Si vous avez reçu une invitation, elle apparaîtra ici.
                    </p>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
    </div>
  );
}

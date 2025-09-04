// src/app/dashboard/entreprise/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight, PlusCircle, Trash2, Settings, Building } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";
import { useEnterprise } from "@/context/enterprise-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountingPage from "../accounting/page";


function EnterpriseManagement() {
  const { t } = useLocale();
  const { enterprises, deleteEnterprise, isLoading } = useEnterprise();

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Vos Entreprises</h1>
        <Button asChild>
            <Link href="/dashboard/entreprise/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer une entreprise
            </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Liste des entreprises</CardTitle>
            <CardDescription>Sélectionnez une entreprise pour gérer son équipe et ses finances.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
            {isLoading && (
              <>
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
              </>
            )}
            {!isLoading && enterprises.map((enterprise) => (
                 <Card key={enterprise.id} className="hover:border-primary/50 hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg">{enterprise.name}</CardTitle>
                            <CardDescription>Propriétaire</CardDescription>
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
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Settings className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Supprimer
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Voulez-vous vraiment supprimer "{enterprise.name}" ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. Toutes les données associées à cette entreprise, y compris les équipes, les transactions et les conversations, seront définitivement supprimées.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteEnterprise(enterprise.id)} className="bg-destructive hover:bg-destructive/90">
                                    Oui, supprimer
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            ))}
             {!isLoading && enterprises.length === 0 && (
                <Card className="border-dashed flex flex-col items-center justify-center text-center p-6 md:col-span-2">
                    <CardHeader>
                        <div className="mx-auto bg-secondary p-4 rounded-full mb-4 w-fit">
                           <Building className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-muted-foreground">Aucune entreprise créée</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                           Commencez par créer votre première entreprise pour gérer vos équipes et vos finances professionnelles.
                        </p>
                        <Button asChild>
                            <Link href="/dashboard/entreprise/create">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Créer la première entreprise
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
             )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function EntrepriseHubPage() {
  const { t } = useLocale();

  return (
    <Tabs defaultValue="management" className="space-y-4">
      <TabsList>
        <TabsTrigger value="management">Gestion d'Entreprise</TabsTrigger>
        <TabsTrigger value="accounting">Comptabilité</TabsTrigger>
      </TabsList>
      <TabsContent value="management">
        <EnterpriseManagement />
      </TabsContent>
      <TabsContent value="accounting">
        <AccountingPage />
      </TabsContent>
    </Tabs>
  );
}
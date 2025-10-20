// src/app/dashboard/entreprise/products/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Package, MoreHorizontal, ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProducts } from "@/context/product-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const { products, deleteProduct, isLoading } = useProducts();
  const { formatCurrency } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/entreprise">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <h1 className="text-3xl font-bold font-headline">Vos Produits</h1>
        </div>
        <Button asChild>
          <Link href="/dashboard/entreprise/products/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau produit
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventaire</CardTitle>
          <CardDescription>Liste de tous les produits de votre boutique.</CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? (
             <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
           ) : products.length === 0 ? (
             <div className="flex flex-col items-center justify-center text-center p-12 border-dashed border-2 rounded-lg">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Aucun produit dans l'inventaire</h3>
                <p className="text-muted-foreground mt-2 mb-4">Commencez par ajouter votre premier produit.</p>
                <Button asChild>
                  <Link href="/dashboard/entreprise/products/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un produit
                  </Link>
                </Button>
            </div>
           ) : (
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell>
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                                {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover"/>
                                ) : (
                                <Package />
                                )}
                            </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                            {product.promoPrice ? (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-destructive font-semibold">{formatCurrency(product.promoPrice)}</span>
                                    <span className="text-xs text-muted-foreground line-through">{formatCurrency(product.price)}</span>
                                </div>
                            ) : (
                                formatCurrency(product.price)
                            )}
                        </TableCell>
                        <TableCell>
                            <Badge variant={product.quantity > 10 ? 'default' : product.quantity > 0 ? 'secondary' : 'destructive'}>
                                {product.quantity} en stock
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" /> Modifier
                                    </DropdownMenuItem>
                                     <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce produit ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. Le produit "{product.name}" sera définitivement supprimé.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteProduct(product.id)} className="bg-destructive hover:bg-destructive/90">
                                        Supprimer
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
             </Table>
           )}
        </CardContent>
      </Card>

    </div>
  );
}

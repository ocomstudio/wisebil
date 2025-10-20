// src/app/dashboard/entreprise/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ShoppingCart, Package, DollarSign, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useSales } from "@/context/sale-context";
import { useProducts } from "@/context/product-context";
import { useLocale } from "@/context/locale-context";

export default function EnterprisePage() {
  const { sales } = useSales();
  const { products } = useProducts();
  const { formatCurrency } = useLocale();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProductsSold = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">Gestion de la Boutique</h1>
        <div className="flex gap-2">
           <Button asChild>
            <Link href="/dashboard/entreprise/products/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Link>
          </Button>
           <Button asChild variant="secondary">
            <Link href="/dashboard/entreprise/sales/create">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Créer une vente
            </Link>
          </Button>
        </div>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Basé sur {sales.length} ventes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{sales.length}</div>
            <p className="text-xs text-muted-foreground">{totalProductsSold} produits vendus au total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Produits uniques dans l'inventaire</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
                <CardTitle>Ventes Récentes</CardTitle>
                <CardDescription>Aperçu des dernières transactions enregistrées.</CardDescription>
            </CardHeader>
            <CardContent>
                {sales.length > 0 ? (
                    <div className="space-y-4">
                        {sales.slice(0, 5).map(sale => (
                             <div key={sale.id} className="flex items-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg">
                                    🛒
                                </div>
                                <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">Vente à {sale.customerName}</p>
                                <p className="text-sm text-muted-foreground">{sale.items.length} produit(s)</p>
                                </div>
                                <div className="ml-auto font-medium">{formatCurrency(sale.total)}</div>
                                <Button variant="ghost" size="icon" className="ml-2" asChild>
                                    <Link href={`/dashboard/entreprise/sales/invoice/${sale.id}`}>
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ): (
                     <div className="text-center text-muted-foreground py-8">
                        <p>Aucune vente enregistrée pour le moment.</p>
                     </div>
                )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Inventaire des Produits</CardTitle>
                <CardDescription>Aperçu rapide de votre stock.</CardDescription>
                 <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href="/dashboard/entreprise/products">
                        Gérer les produits
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {products.length > 0 ? (
                     <div className="space-y-4">
                        {products.slice(0, 5).map(product => (
                            <div key={product.id} className="flex items-center">
                                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                                     {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover"/>
                                     ) : (
                                        <Package />
                                     )}
                                </div>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                                </div>
                                <div className="ml-auto font-medium">{product.quantity} en stock</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>Aucun produit dans votre inventaire.</p>
                    </div>
                )}
            </CardContent>
          </Card>
      </div>

    </div>
  );
}

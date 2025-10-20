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
    <div className="space-y-6 pb-24 md:pb-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">Gestion de la Boutique</h1>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard/entreprise/sales/create">
                <Card className="h-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all transform-gpu hover:scale-[1.03] shadow-lg shadow-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                        <CardTitle className="text-xl font-bold">Créer une vente</CardTitle>
                        <ShoppingCart className="h-8 w-8" />
                    </CardHeader>
                </Card>
            </Link>
            <Link href="/dashboard/entreprise/products/create">
                <Card className="h-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all transform-gpu hover:scale-[1.03] shadow-lg shadow-secondary/20">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                        <CardTitle className="text-xl font-bold">Ajouter un produit</CardTitle>
                        <PlusCircle className="h-8 w-8" />
                    </CardHeader>
                </Card>
            </Link>
       </div>


       <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="sm:col-span-3">
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits Vendus</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductsSold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nb. Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
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

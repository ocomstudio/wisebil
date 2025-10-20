// src/app/dashboard/entreprise/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ShoppingCart, Package, DollarSign, ArrowUpRight, Leaf, Settings } from "lucide-react";
import Link from "next/link";
import { useSales } from "@/context/sale-context";
import { useProducts } from "@/context/product-context";
import { useLocale } from "@/context/locale-context";

export default function EnterprisePage() {
  const { sales } = useSales();
  const { products } = useProducts();
  const { t, formatCurrency } = useLocale();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProductsSold = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">{t('nav_enterprise')}</h1>
        <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/settings/company-profile">
                <Settings className="mr-2 h-4 w-4" />
                {t('company_settings_button')}
            </Link>
        </Button>
      </div>

       <Card className="bg-card text-card-foreground shadow-xl rounded-2xl overflow-hidden relative border-primary/20 transform-gpu transition-transform hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent z-0 opacity-40"></div>
            <div className="absolute -right-10 -bottom-16 opacity-10">
                <Leaf className="h-48 w-48 text-primary" />
            </div>
            <CardContent className="p-6 relative z-10">
                 <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-primary-foreground/80 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {t('total_revenue_label')}
                        </p>
                        <p className="text-4xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
                    </div>
                 </div>
                 <p className="text-xs text-muted-foreground mt-2">{t('based_on_sales_label', { count: sales.length })}</p>
            </CardContent>
       </Card>

       <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/entreprise/sales/create" className="col-span-1">
                <Card className="h-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all transform-gpu hover:scale-[1.03] shadow-lg shadow-primary/20">
                    <CardHeader className="flex flex-col items-center justify-center text-center p-4">
                        <ShoppingCart className="h-8 w-8 mb-2" />
                        <CardTitle className="text-base font-bold">{t('create_sale_button')}</CardTitle>
                    </CardHeader>
                </Card>
            </Link>
            <Link href="/dashboard/entreprise/products/create" className="col-span-1">
                <Card className="h-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all transform-gpu hover:scale-[1.03] shadow-lg shadow-secondary/20">
                     <CardHeader className="flex flex-col items-center justify-center text-center p-4">
                        <PlusCircle className="h-8 w-8 mb-2" />
                        <CardTitle className="text-base font-bold">{t('add_product_button')}</CardTitle>
                    </CardHeader>
                </Card>
            </Link>
       </div>


       <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('sales_label')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{sales.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('products_sold_label')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductsSold}</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_products_label')}</CardTitle>
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
                <CardTitle>{t('recent_sales_title')}</CardTitle>
                <CardDescription>{t('recent_sales_desc')}</CardDescription>
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
                                <p className="text-sm font-medium leading-none">{t('sale_to_customer_label', { customerName: sale.customerName })}</p>
                                <p className="text-sm text-muted-foreground">{t('product_count_label', { count: sale.items.length })}</p>
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
                        <p>{t('no_sales_recorded_label')}</p>
                     </div>
                )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>{t('product_inventory_title')}</CardTitle>
                <CardDescription>{t('product_inventory_desc')}</CardDescription>
                 <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href="/dashboard/entreprise/products">
                        {t('manage_products_button')}
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
                                <div className="ml-auto font-medium">{t('in_stock_label', { count: product.quantity })}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>{t('no_products_in_inventory_label')}</p>
                    </div>
                )}
            </CardContent>
          </Card>
      </div>

    </div>
  );
}


// src/app/dashboard/entreprise/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ShoppingCart, Package, DollarSign, ArrowUpRight, Leaf, Settings, RefreshCw, Activity, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSales } from "@/context/sales-context";
import { useProducts } from "@/context/product-context";
import { useLocale } from "@/context/locale-context";
import { usePurchases } from "@/context/purchase-context";
import { ActivityHistory } from "@/components/dashboard/entreprise/activity-history";
import { useAuth } from "@/context/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEnterprise } from "@/context/enterprise-context";

const TRIAL_PERIOD_DAYS = 28;

export default function EnterprisePage() {
  const { sales } = useSales();
  const { products } = useProducts();
  const { purchases } = usePurchases();
  const { t, formatCurrency } = useLocale();
  const { user } = useAuth();
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState(false);
  const isMobile = useIsMobile();
  const { isTrialActive, trialDaysRemaining } = useEnterprise();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProductsSold = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  const SubscriptionBanner = () => {
    const subscriptionStatus = user?.subscriptionStatus || 'inactive';

    if (subscriptionStatus === 'active') {
      const planName = user?.subscriptionPlan === 'premium' ? t('plan_premium_title') : t('plan_business_title');
      return (
        <Card className="bg-green-600/10 border-green-600/20 text-green-500">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>{t('plan_active', { planName })}</span>
            </CardTitle>
          </CardHeader>
        </Card>
      )
    }

    if (trialDaysRemaining > 0) {
        return (
           <Card className="bg-amber-500/10 border-amber-500/20 text-amber-500">
              <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <span>{t('trial_days_remaining', { days: trialDaysRemaining })}</span>
                        </CardTitle>
                        <CardDescription className="text-amber-500/80 text-xs mt-1">
                            {t('upgrade_to_keep_features')}
                        </CardDescription>
                    </div>
                     <Button asChild size="sm" variant="outline" className="bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30">
                        <Link href="/dashboard/billing">{t('see_plans_button')}</Link>
                    </Button>
                </div>
              </CardHeader>
            </Card>
        );
    }
    
    // Trial expired
    return (
        <Card className="bg-destructive/10 border-destructive/20 text-destructive">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <span>Période d'essai terminée</span>
                    </CardTitle>
                    <CardDescription className="text-destructive/80 text-xs mt-1">
                        Passez à un plan supérieur pour continuer à utiliser les fonctionnalités Entreprise.
                    </CardDescription>
                </div>
                 <Button asChild size="sm" variant="outline" className="bg-destructive/20 border-destructive/30 hover:bg-destructive/30 text-destructive">
                    <Link href="/dashboard/billing">{t('see_plans_button')}</Link>
                </Button>
            </div>
          </CardHeader>
        </Card>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">{t('nav_enterprise')}</h1>
         <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsActivityHistoryOpen(true)}>
                <Activity className="mr-2 h-4 w-4" />
                {t('history_button')}
            </Button>
            <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/settings/company-profile">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('company_settings_button')}
                </Link>
            </Button>
         </div>
      </div>
      
      <SubscriptionBanner />

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

       <div className="grid grid-cols-3 gap-2">
            <Button asChild className="col-span-1 h-auto p-0" variant="ghost">
                <Link href="/dashboard/entreprise/sales/create">
                    <Card className="w-full h-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all transform-gpu hover:shadow-xl hover:shadow-primary/20">
                        <CardHeader className="flex flex-col items-center justify-center text-center p-2">
                            <ShoppingCart className="h-6 w-6 mb-1" />
                            <CardTitle className="text-xs font-bold">{t('nav_sales')}</CardTitle>
                        </CardHeader>
                    </Card>
                </Link>
            </Button>
             <Button asChild className="col-span-1 h-auto p-0" variant="ghost">
                <Link href="/dashboard/entreprise/products/create">
                    <Card className="w-full h-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all transform-gpu hover:shadow-xl hover:shadow-secondary/20">
                        <CardHeader className="flex flex-col items-center justify-center text-center p-2">
                            <PlusCircle className="h-6 w-6 mb-1" />
                            <CardTitle className="text-xs font-bold">{t('nav_products')}</CardTitle>
                        </CardHeader>
                    </Card>
                </Link>
            </Button>
             <Button asChild className="col-span-1 h-auto p-0" variant="ghost">
                <Link href="/dashboard/entreprise/purchases/create">
                    <Card className="w-full h-full bg-accent text-accent-foreground hover:bg-accent/90 transition-all transform-gpu hover:shadow-xl hover:shadow-accent/20">
                        <CardHeader className="flex flex-col items-center justify-center text-center p-2">
                            <RefreshCw className="h-6 w-6 mb-1" />
                            <CardTitle className="text-xs font-bold">{t('nav_purchases')}</CardTitle>
                        </CardHeader>
                    </Card>
                </Link>
            </Button>
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
              <div className="flex items-center justify-between">
                <CardTitle>{t('recent_sales_title')}</CardTitle>
                {isMobile && sales.length > 0 && (
                  <Button asChild variant="link" size="sm">
                    <Link href="/dashboard/entreprise/sales/invoices">{t('see_all')}</Link>
                  </Button>
                )}
              </div>
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
           <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('recent_purchases_title')}</CardTitle>
                {isMobile && purchases.length > 0 && (
                   <Button asChild variant="link" size="sm">
                    <Link href="/dashboard/entreprise/purchases/invoices">{t('see_all')}</Link>
                  </Button>
                )}
              </div>
              <CardDescription>{t('recent_purchases_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                {purchases.length > 0 ? (
                    <div className="space-y-4">
                        {purchases.slice(0, 5).map(purchase => (
                             <div key={purchase.id} className="flex items-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg">
                                    <RefreshCw />
                                </div>
                                <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{t('purchase_from_supplier_label', { supplierName: purchase.supplierName })}</p>
                                <p className="text-sm text-muted-foreground">{t('product_count_label', { count: purchase.items.length })}</p>
                                </div>
                                <div className="ml-auto font-medium">{formatCurrency(purchase.total)}</div>
                                <Button variant="ghost" size="icon" className="ml-2" asChild>
                                    <Link href={`/dashboard/entreprise/purchases/invoice/${purchase.id}`}>
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ): (
                     <div className="text-center text-muted-foreground py-8">
                        <p>{t('no_purchases_recorded_label')}</p>
                     </div>
                )}
            </CardContent>
          </Card>
      </div>
      <ActivityHistory isOpen={isActivityHistoryOpen} onOpenChange={setIsActivityHistoryOpen} />
    </div>
  );
}

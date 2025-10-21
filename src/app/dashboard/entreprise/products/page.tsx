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
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const { products, deleteProduct, isLoading, getCategoryById } = useProducts();
  const { t, formatCurrency, formatDate } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/entreprise">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <h1 className="text-3xl font-bold font-headline">{t('your_products_title')}</h1>
        </div>
        <Button asChild>
          <Link href="/dashboard/entreprise/products/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('new_product_button')}
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('inventory_title')}</CardTitle>
          <CardDescription>{t('inventory_desc')}</CardDescription>
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
                <h3 className="text-xl font-semibold">{t('no_products_title')}</h3>
                <p className="text-muted-foreground mt-2 mb-4">{t('no_products_desc')}</p>
                <Button asChild>
                  <Link href="/dashboard/entreprise/products/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('add_first_product_button')}
                  </Link>
                </Button>
            </div>
           ) : (
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>{t('table_header_name')}</TableHead>
                    <TableHead>{t('table_header_category')}</TableHead>
                    <TableHead>{t('table_header_purchase_date')}</TableHead>
                    <TableHead>{t('table_header_storage')}</TableHead>
                    <TableHead>{t('table_header_price')}</TableHead>
                    <TableHead>{t('table_header_stock')}</TableHead>
                    <TableHead className="text-right">{t('table_header_actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{getCategoryById(product.categoryId || '')?.name || '-'}</TableCell>
                        <TableCell>{formatDate(product.purchaseDate)}</TableCell>
                        <TableCell>{product.storageLocation}</TableCell>
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
                            <Badge variant={product.quantity > (product.initialQuantity * 0.1) ? 'default' : product.quantity > 0 ? 'secondary' : 'destructive'} className={cn(product.quantity <= 0 && "bg-red-600/20 text-red-500 border-red-500/20", product.quantity > 0 && product.quantity <= (product.initialQuantity * 0.25) && "bg-yellow-600/20 text-yellow-500 border-yellow-500/20")}>
                                {product.quantity} / {product.initialQuantity}
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
                                    <DropdownMenuItem asChild>
                                       <Link href={`/dashboard/entreprise/products/edit/${product.id}`}>
                                        <Edit className="mr-2 h-4 w-4" /> {t('edit')}
                                       </Link>
                                    </DropdownMenuItem>
                                     <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> {t('delete')}
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('product_delete_confirm_title')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('product_delete_confirm_desc', { productName: product.name })}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteProduct(product.id)} className="bg-destructive hover:bg-destructive/90">
                                        {t('delete')}
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

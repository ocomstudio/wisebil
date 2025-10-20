// src/app/dashboard/entreprise/purchases/invoices/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";

export default function PurchaseInvoicesPage() {
  const { t } = useLocale();

  return (
    <div className="flex items-center justify-center h-full pt-10 md:pt-0">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full mb-4 w-fit">
            <Construction className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="font-headline">{t('coming_soon_title')}</CardTitle>
          <CardDescription>
            {t('feature_under_construction')}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
                {t('feature_purchase_invoices_desc')}
            </p>
            <Button asChild>
                <Link href="/dashboard/entreprise">
                    {t('back_to_enterprise_dashboard')}
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

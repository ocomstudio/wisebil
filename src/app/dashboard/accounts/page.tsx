// src/app/dashboard/accounts/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";

export default function AccountsPage() {
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
            {t('coming_soon_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
                {t('coming_soon_subdesc')}
            </p>
            <Button asChild>
                <Link href="/dashboard">
                    {t('back_to_dashboard')}
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

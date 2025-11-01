// src/components/dashboard/entreprise/enterprise-mobile-puller.tsx
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/locale-context";

export function EnterpriseMobilePuller() {
    const isMobile = useIsMobile();
    const router = useRouter();
    const { t } = useLocale();

    if (!isMobile) return null;

    return (
        <div
            onClick={() => router.push('/dashboard/entreprise')}
            className="w-full bg-card p-4 rounded-xl shadow-lg cursor-pointer flex items-center justify-between text-card-foreground transform-gpu transition-transform hover:scale-[1.02]"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Building className="h-5 w-5 text-primary"/>
                </div>
                <div className="font-semibold">{t('nav_enterprise')}</div>
            </div>
            <ArrowUp className="h-5 w-5 text-muted-foreground animate-bounce" />
        </div>
    );
}

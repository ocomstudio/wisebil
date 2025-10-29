// src/components/dashboard/entreprise/enterprise-mobile-puller.tsx
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowDown } from "lucide-react";
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
            className="-mx-4 mb-2 cursor-pointer"
        >
            <div className="p-2 pt-4 text-center text-xs text-muted-foreground bg-transparent">
                <p className="font-semibold select-none">{t('open_enterprise_space')}</p>
                 <ArrowDown className="h-5 w-5 mx-auto opacity-70 animate-bounce" />
            </div>
        </div>
    );
}

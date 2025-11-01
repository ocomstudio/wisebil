// src/components/dashboard/entreprise/enterprise-mobile-puller.tsx
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/locale-context";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const AnimatedText = () => {
    const { t } = useLocale();
    const phrases = [
        t('animated_text_sales'),
        t('animated_text_purchases'),
        t('animated_text_inventory'),
        t('animated_text_overview'),
    ];

    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [text, setText] = useState('');
    
    // Typing speed and delay configuration
    const typingDelay = 100;
    const erasingDelay = 50;
    const pauseDelay = 2000;

    useEffect(() => {
        if (isDeleting) {
            if (subIndex === 0) {
                setIsDeleting(false);
                setIndex((prevIndex) => (prevIndex + 1) % phrases.length);
                return;
            }
            const timeout = setTimeout(() => {
                setText(phrases[index].substring(0, subIndex - 1));
                setSubIndex(subIndex - 1);
            }, erasingDelay);
            return () => clearTimeout(timeout);
        }

        if (subIndex === phrases[index].length) {
            const timeout = setTimeout(() => {
                setIsDeleting(true);
            }, pauseDelay);
            return () => clearTimeout(timeout);
        }

        const timeout = setTimeout(() => {
            setText(phrases[index].substring(0, subIndex + 1));
            setSubIndex(subIndex + 1);
        }, typingDelay);

        return () => clearTimeout(timeout);
    }, [subIndex, isDeleting, index, phrases]);

    return (
        <span className="text-primary font-medium text-sm ml-2">
            {text}
            <span className="animate-pulse">|</span>
        </span>
    );
};


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
                <div className="font-semibold">{t('open_enterprise_space')}</div>
                 <AnimatedText />
            </div>
            <ArrowUp className="h-5 w-5 text-muted-foreground animate-bounce" />
        </div>
    );
}

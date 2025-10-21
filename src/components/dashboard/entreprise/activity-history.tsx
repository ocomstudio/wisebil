// src/components/dashboard/entreprise/activity-history.tsx
"use client";

import { useMemo } from "react";
import { useUserData } from "@/context/user-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Activity, 
    ShoppingCart, 
    PackagePlus, 
    Pencil, 
    Trash2,
    RefreshCw
} from "lucide-react";
import { useLocale } from "@/context/locale-context";
import type { ActivityLog, ActivityType } from "@/types/activity-log";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface ActivityHistoryProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
    product_created: <PackagePlus className="h-5 w-5 text-green-500" />,
    product_updated: <Pencil className="h-5 w-5 text-blue-500" />,
    product_deleted: <Trash2 className="h-5 w-5 text-red-500" />,
    sale_created: <ShoppingCart className="h-5 w-5 text-green-500" />,
    sale_updated: <Pencil className="h-5 w-5 text-blue-500" />,
    sale_deleted: <Trash2 className="h-5 w-5 text-red-500" />,
    purchase_created: <RefreshCw className="h-5 w-5 text-green-500" />,
    purchase_updated: <Pencil className="h-5 w-5 text-blue-500" />,
    purchase_deleted: <Trash2 className="h-5 w-5 text-red-500" />,
};

export function ActivityHistory({ isOpen, onOpenChange }: ActivityHistoryProps) {
    const { userData, isLoading } = useUserData();
    const { t, formatDate } = useLocale();

    const sortedAndFilteredActivities = useMemo(() => {
        if (!userData?.enterpriseActivities) return [];

        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        return userData.enterpriseActivities
            .filter(log => new Date(log.timestamp) > fiveDaysAgo)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
    }, [userData?.enterpriseActivities]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col h-[80vh] max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        {t('activity_history_title')}
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 -mx-6 px-2">
                    {isLoading ? (
                         <div className="space-y-4 px-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : sortedAndFilteredActivities.length === 0 ? (
                        <div className="text-center text-muted-foreground pt-10 px-4">
                             <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50"/>
                            <p className="font-semibold">{t('no_activity_yet')}</p>
                            <p className="text-sm">Les actions sur les produits, ventes et achats apparaîtront ici.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 px-4">
                            {sortedAndFilteredActivities.map((log: ActivityLog) => (
                                <Card key={log.id} className="p-3">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-secondary p-2 rounded-full mt-1">
                                            {activityIcons[log.type] || <Activity className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{log.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(log.timestamp)} - {log.userName}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

// src/components/dashboard/entreprise/activity-history.tsx
"use client";

import { useUserData } from "@/context/user-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { cn } from "@/lib/utils";
import type { ActivityLog, ActivityType } from "@/types/activity-log";

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

    const sortedActivities = userData?.enterpriseActivities?.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) || [];

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        {t('activity_history_title')}
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 -mx-6 px-6">
                    {isLoading ? (
                        <p>{t('loading_tip')}</p>
                    ) : sortedActivities.length === 0 ? (
                        <div className="text-center text-muted-foreground pt-10">
                            <p>{t('no_activity_yet')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedActivities.map((log: ActivityLog) => (
                                <div key={log.id} className="flex items-start gap-3">
                                    <div className="bg-muted p-2 rounded-full mt-1">
                                        {activityIcons[log.type] || <Activity className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">{log.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(log.timestamp)} - {log.userName}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

// src/app/dashboard/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, X } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/context/notifications-context";


export default function NotificationsPage() {
  const { t } = useLocale();
  const { notifications, removeNotification, markAllAsRead } = useNotifications();
  const [closingId, setClosingId] = useState<number | null>(null);

  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);


  const handleClose = (id: number) => {
    setClosingId(id);
    setTimeout(() => {
      removeNotification(id);
      setClosingId(null);
    }, 300); // Wait for fade-out animation
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="md:hidden">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">{t('notifications')}</h1>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>{t('notification_page_title')}</CardTitle>
          <CardDescription>
            {t('notification_page_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    `p-4 rounded-lg flex items-start gap-4 transition-all duration-300 ease-in-out`,
                    notification.isNew ? 'bg-primary/10' : 'bg-muted/50',
                    closingId === notification.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  )}
                >
                  <div className="p-2 bg-background rounded-full mt-1">
                      {notification.icon}
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleClose(notification.id)}>
                      <X className="h-4 w-4"/>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4"/>
                <p>Aucune nouvelle notification.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

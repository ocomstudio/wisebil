// src/app/dashboard/notifications/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Lightbulb, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";

export default function NotificationsPage() {
  const { t } = useLocale();

  const notifications = [
    {
      icon: <Lightbulb className="h-6 w-6 text-yellow-400" />,
      title: t('notification_tip_title'),
      description: t('notification_tip_desc'),
      time: t('time_5_minutes_ago'),
      isNew: true,
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      title: t('notification_goal_title'),
      description: t('notification_goal_desc'),
      time: t('time_2_hours_ago'),
      isNew: true,
    },
    {
      icon: <Bell className="h-6 w-6 text-primary" />,
      title: t('notification_bill_title'),
      description: t('notification_bill_desc'),
      time: t('time_yesterday'),
      isNew: false,
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-yellow-400" />,
      title: t('notification_advice_title'),
      description: t('notification_advice_desc'),
      time: t('time_2_days_ago'),
      isNew: false,
    },
  ];

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
            {notifications.map((notification, index) => (
              <div key={index} className={`p-4 rounded-lg flex items-start gap-4 transition-colors ${notification.isNew ? 'bg-primary/10' : 'bg-muted/50'}`}>
                <div className="p-2 bg-background rounded-full mt-1">
                    {notification.icon}
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <X className="h-4 w-4"/>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

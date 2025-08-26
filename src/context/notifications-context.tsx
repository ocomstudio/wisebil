// src/context/notifications-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Lightbulb, TrendingUp, Bell } from "lucide-react";
import { useLocale } from './locale-context';

interface Notification {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  removeNotification: (id: number) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useLocale();

  const initialNotifications: Notification[] = [
    {
      id: 1,
      icon: <Lightbulb className="h-6 w-6 text-yellow-400" />,
      title: t('notification_tip_title'),
      description: t('notification_tip_desc'),
      time: t('time_5_minutes_ago'),
      isNew: true,
    },
    {
      id: 2,
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      title: t('notification_goal_title'),
      description: t('notification_goal_desc'),
      time: t('time_2_hours_ago'),
      isNew: true,
    },
    {
      id: 3,
      icon: <Bell className="h-6 w-6 text-primary" />,
      title: t('notification_bill_title'),
      description: t('notification_bill_desc'),
      time: t('time_yesterday'),
      isNew: false,
    },
     {
      id: 4,
      icon: <Lightbulb className="h-6 w-6 text-yellow-400" />,
      title: t('notification_advice_title'),
      description: t('notification_advice_desc'),
      time: t('time_2_days_ago'),
      isNew: false,
    },
  ];
  
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => n.isNew).length);
  }, [notifications]);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, removeNotification, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

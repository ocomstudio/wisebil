// src/context/notifications-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { Lightbulb, TrendingUp, Bell } from "lucide-react";
import { useLocale } from './locale-context';
import { useSettings } from './settings-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from './auth-context';

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
  isReminderEnabled: boolean;
  setIsReminderEnabled: (enabled: boolean) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Interval de rappel (5 secondes pour le test)
const REMINDER_INTERVAL = 5 * 1000;

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useLocale();
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  
  const [isReminderEnabled, setIsReminderEnabledState] = useState(settings.isReminderEnabled ?? true);
  const reminderIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
  
  const playNotificationSound = useCallback(() => {
    const audio = new Audio('/notification.mp3');
    // Simuler une vibration si l'API est disponible
    // if ('vibrate' in navigator) {
    //   navigator.vibrate(200); // Vibre pendant 200ms
    // }
    audio.play().catch(error => console.error("Error playing sound:", error));
  }, []);

  const stopReminders = useCallback(() => {
    if (reminderIntervalRef.current) {
      clearInterval(reminderIntervalRef.current);
      reminderIntervalRef.current = null;
    }
  }, []);

  const startReminders = useCallback(() => {
    stopReminders(); // Assure qu'il n'y a pas de doublons
    if (isReminderEnabled && user) {
      reminderIntervalRef.current = setInterval(() => {
        playNotificationSound();
      }, REMINDER_INTERVAL);
    }
  }, [isReminderEnabled, user, playNotificationSound, stopReminders]);

  useEffect(() => {
    // Synchroniser l'état local avec les paramètres globaux
    setIsReminderEnabledState(settings.isReminderEnabled ?? true);
  }, [settings.isReminderEnabled]);

  useEffect(() => {
    // Désactivé temporairement pour corriger le bug de vibration
    // if (isReminderEnabled) {
    //   startReminders();
    // } else {
    //   stopReminders();
    // }
    
    // Nettoyer l'intervalle lorsque le composant est démonté
    return () => stopReminders();
  }, [isReminderEnabled, startReminders, stopReminders]);

  const setIsReminderEnabled = (enabled: boolean) => {
    setIsReminderEnabledState(enabled);
    updateSettings({ isReminderEnabled: enabled });
  };

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
    <NotificationsContext.Provider value={{ 
        notifications, 
        unreadCount, 
        removeNotification, 
        markAllAsRead,
        isReminderEnabled,
        setIsReminderEnabled,
    }}>
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

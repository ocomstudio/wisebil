// src/types/activity-log.ts

export type ActivityType =
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'sale_created'
  | 'sale_updated'
  | 'sale_deleted'
  | 'purchase_created'
  | 'purchase_updated'
  | 'purchase_deleted';

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO date string
  type: ActivityType;
  description: string;
  userName: string;
  userId: string;
}

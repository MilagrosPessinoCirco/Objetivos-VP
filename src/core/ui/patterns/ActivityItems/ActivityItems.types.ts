import type { ReactNode } from 'react';

export type ActivityStatus = 'neutral' | 'info' | 'success' | 'warning' | 'critical';
export type ActivityItemVariant = 'comment' | 'deletion' | 'notice' | 'photoComment';

export interface IActivityItem {
  key: string;
  variant: ActivityItemVariant;
  author: string;
  verb: string;
  description?: string;
  subject?: string;
  time?: string;
  avatarSrc?: string;
}

export interface IActivityItemsProps {
  items: IActivityItem[];
  title?: string;
  emptyMessage?: string;
  className?: string;
}

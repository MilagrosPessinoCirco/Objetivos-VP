import type { ReactNode } from 'react';

export type CardVariant = 'simple' | 'bandeja' | 'tray' | 'simpleButton' | 'detail' | 'vertical' | 'horizontal';

export interface ICardComment {
  author: string;
  text: string;
  avatar?: ReactNode;
  actionText?: string;
}

export interface ICardProps {
  variant?: CardVariant;
  title?: string;
  subtitle?: string;
  description?: string;
  metadata?: string[];
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  image?: ReactNode;
  activity?: ReactNode;
  comment?: ICardComment;
  children?: ReactNode;
  className?: string;
}

import type { ReactNode } from 'react';

export type HomeCardType = 'simple' | 'bandeja' | 'detail' | 'simpleButton';

export interface IHomeCardProps {
  type?: HomeCardType;
  title: string;
  value?: string;
  icon?: ReactNode;
  details?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

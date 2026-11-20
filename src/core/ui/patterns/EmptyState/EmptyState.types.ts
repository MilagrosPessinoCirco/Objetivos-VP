import type { ReactNode } from 'react';

export interface IEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  icon?: ReactNode;
  action?: ReactNode;
  darkMode?: boolean;
  className?: string;
  onAction?: () => void;
}

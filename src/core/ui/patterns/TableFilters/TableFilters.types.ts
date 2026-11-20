import type { ReactNode } from 'react';

export interface ITableFiltersProps {
  title?: string;
  info?: string;
  showTitle?: boolean;
  showBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  children?: ReactNode;
  onReload?: () => void;
  onApply?: () => void;
  darkMode?: boolean;
  className?: string;
}

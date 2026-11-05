import type { ReactNode } from 'react';

export interface IPivotItem {
  key: string;
  label: string;
  icon?: ReactNode;
  content?: ReactNode;
}

export interface IPivotProps {
  items: IPivotItem[];
  value?: string;
  defaultValue?: string;
  darkMode?: boolean;
  ariaLabel?: string;
  onChange?: (key: string) => void;
  className?: string;
}

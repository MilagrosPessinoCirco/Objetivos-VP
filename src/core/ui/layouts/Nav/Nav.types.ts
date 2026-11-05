import type { ReactNode } from 'react';

export type NavItemStatus = 'default' | 'hover' | 'active' | 'disabled' | 'open';

export interface INavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  status?: NavItemStatus;
  children?: INavItem[];
}

export interface INavProps {
  items: INavItem[];
  title?: string;
  showHeader?: boolean;
  darkMode?: boolean;
  open?: boolean;
  selectedKey?: string;
  onClose?: () => void;
  onItemClick?: (item: INavItem) => void;
  className?: string;
}

import type { ReactNode } from 'react';

export interface ICommandBarMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export interface ICommandBarItem {
  key: string;
  label: string;
  icon?: ReactNode;
  menu?: ReactNode;
  menuItems?: ICommandBarMenuItem[];
  disabled?: boolean;
  onClick?: () => void;
}

export interface ICommandBarProps {
  items: ICommandBarItem[];
  darkMode?: boolean;
  className?: string;
}

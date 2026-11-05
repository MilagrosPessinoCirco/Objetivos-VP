import type { ReactNode } from 'react';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsSize = 'medium' | 'small';
export type TabsStyle = 'transparent' | 'subtle' | 'filled';

export interface ITabItem {
  key: string;
  label?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ITabsProps {
  items: ITabItem[];
  value?: string;
  defaultValue?: string;
  orientation?: TabsOrientation;
  size?: TabsSize;
  variant?: TabsStyle;
  circular?: boolean;
  ariaLabel?: string;
  onChange?: (key: string) => void;
  className?: string;
}

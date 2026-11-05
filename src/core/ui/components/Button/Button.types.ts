import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { IContextualMenuItem } from '@fluentui/react';

export type ButtonVariant = 'primary' | 'secondary' | 'compound';
export type ButtonSize = 'default' | 'small';
export type ButtonColor = 'blue' | 'red' | 'green';
export type ButtonType = 'standard' | 'split' | 'icon' | 'iconSplit' | 'contextualMenu';

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  darkMode?: boolean;
  buttonType?: ButtonType;
  secondaryText?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  iconOnly?: boolean;
  circular?: boolean;
  split?: boolean;
  menuItems?: IContextualMenuItem[];
  onSplitClick?: () => void;
}

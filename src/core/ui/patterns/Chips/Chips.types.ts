import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ChipVariant = 'filled' | 'outline' | 'subtle';
export type ChipSize = 'small' | 'medium' | 'large';
export type ChipColor = 'neutral' | 'brand' | 'secondary' | 'success' | 'warning' | 'danger';

export interface IChipItem {
  key: string;
  label: string;
  value?: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  ariaLabel?: string;
  onRemove?: (key: string) => void;
}

export interface IChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onChange'> {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  variant?: ChipVariant;
  size?: ChipSize;
  color?: ChipColor;
  stroke?: boolean;
  clickable?: boolean;
  darkMode?: boolean;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export interface IChipsProps {
  items: IChipItem[];
  value?: string[];
  defaultValue?: string[];
  multiSelect?: boolean;
  variant?: ChipVariant;
  size?: ChipSize;
  color?: ChipColor;
  stroke?: boolean;
  clickable?: boolean;
  darkMode?: boolean;
  disabled?: boolean;
  removable?: boolean;
  onChange?: (selectedKeys: string[]) => void;
  onSelect?: (item: IChipItem, selectedKeys: string[]) => void;
  className?: string;
}

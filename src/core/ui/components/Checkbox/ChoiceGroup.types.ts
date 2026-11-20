import type { ReactNode } from 'react';

export interface IChoiceOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface IChoiceGroupProps {
  name: string;
  options: IChoiceOption[];
  label?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  darkMode?: boolean;
  error?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}

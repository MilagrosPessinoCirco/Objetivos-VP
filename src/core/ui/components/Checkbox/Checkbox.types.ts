import type { InputHTMLAttributes, ReactNode } from 'react';

export interface ICheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  required?: boolean;
  indeterminate?: boolean;
  error?: boolean;
}

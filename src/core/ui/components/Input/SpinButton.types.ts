import type { InputHTMLAttributes } from 'react';

export interface ISpinButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  required?: boolean;
  errorMessage?: string;
  step?: number;
}

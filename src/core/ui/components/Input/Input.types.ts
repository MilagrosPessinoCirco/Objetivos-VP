import type { InputHTMLAttributes, ReactNode } from 'react';

export interface IInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  required?: boolean;
  errorMessage?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  readOnly?: boolean;
}

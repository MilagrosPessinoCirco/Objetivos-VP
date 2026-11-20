import type { TextareaHTMLAttributes } from 'react';

export interface IMultilineProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  errorMessage?: string;
}

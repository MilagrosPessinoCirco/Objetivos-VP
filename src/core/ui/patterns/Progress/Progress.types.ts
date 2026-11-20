import type { ReactNode } from 'react';

export type SpinnerLabelPosition = 'above' | 'below' | 'left' | 'right';

export interface ISpinnerProps {
  text?: string;
  labelPosition?: SpinnerLabelPosition;
  darkMode?: boolean;
  icon?: ReactNode;
  className?: string;
}

export interface IProgressBarProps {
  title?: string;
  description?: string;
  value?: number;
  darkMode?: boolean;
  className?: string;
}

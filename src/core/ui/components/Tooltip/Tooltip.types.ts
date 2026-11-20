import type { ReactNode } from 'react';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface ITooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  darkMode?: boolean;
  disabled?: boolean;
  className?: string;
}

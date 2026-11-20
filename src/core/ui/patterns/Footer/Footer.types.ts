import type { ReactNode } from 'react';

export interface IFooterProps {
  primaryText?: string;
  secondaryText?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  darkMode?: boolean;
  children?: ReactNode;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  className?: string;
}

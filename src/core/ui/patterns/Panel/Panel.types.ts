import type { ReactNode } from 'react';

export interface IPanelProps {
  open: boolean;
  title?: string;
  children?: ReactNode;
  footerSlot?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  onClose?: () => void;
  className?: string;
}

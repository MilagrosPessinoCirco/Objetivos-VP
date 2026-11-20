import type { ReactNode } from 'react';

export type MessageBarType = 'success' | 'info' | 'warning' | 'error' | 'blocked' | 'severeWarning';

export interface IMessageBarProps {
  type?: MessageBarType;
  message: string;
  darkMode?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  multiline?: boolean;
  dismissible?: boolean;
  actions?: ReactNode;
  iconName?: string;
  iconColor?: string;
  onClose?: () => void;
  onToggle?: (open: boolean) => void;
  icon?: ReactNode;
  className?: string;
}

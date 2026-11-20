import type { ReactNode } from 'react';

export interface IPersonaTagProps {
  name: string;
  avatar?: ReactNode;
  initials?: string;
  removable?: boolean;
  darkMode?: boolean;
  className?: string;
  onRemove?: () => void;
}

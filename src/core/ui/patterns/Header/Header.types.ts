import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type HeaderColor = 'blue' | 'dark' | 'white';

export interface IHeaderProps {
  color?: HeaderColor;
  mobile?: boolean;
  showLogo?: boolean;
  logo?: ReactNode;
  showMenu?: boolean;
  menuIcon?: ReactNode;
  menuAriaLabel?: string;
  onMenuClick?: () => void;
  appIcon?: ReactNode;
  separator?: boolean;
  title?: string;
  description?: string;
  showPlatformLogo?: boolean;
  platformLogo?: ReactNode;
  rightContent?: ReactNode;
  actions?: ReactNode;
  userName?: string;
  userRole?: string;
  className?: string;
}

export interface INativeHeaderProps extends ButtonHTMLAttributes<HTMLDivElement> {
  logo?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  user?: ReactNode;
  className?: string;
}

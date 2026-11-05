import type { CSSProperties, ReactNode } from 'react';

export type SurfaceVariant = 'default' | 'subtle' | 'raised' | 'outline' | 'dark';
export type SurfacePadding = 'none' | 'compact' | 'comfortable' | 'spacious';

export interface ISurfaceProps {
  children?: ReactNode;
  variant?: SurfaceVariant;
  padding?: SurfacePadding;
  borderRadius?: number;
  darkMode?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

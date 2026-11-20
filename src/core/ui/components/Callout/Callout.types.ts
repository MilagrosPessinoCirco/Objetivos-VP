import type { ReactNode } from 'react';

export type CalloutIndicator = 'top' | 'right' | 'bottom' | 'left';
export type CalloutTheme = 'light' | 'dark';
export type CalloutDirectionalHint =
  | 'bottomCenter' | 'topCenter' | 'leftCenter' | 'rightCenter'
  | 'bottomLeftEdge' | 'bottomRightEdge' | 'topLeftEdge' | 'topRightEdge'
  | 'leftTopEdge' | 'leftBottomEdge' | 'rightTopEdge' | 'rightBottomEdge';

export interface ICalloutProps {
  title: string;
  description?: string;
  indicator?: CalloutIndicator;
  theme?: CalloutTheme;
  darkMode?: boolean;
  directionalHint?: CalloutDirectionalHint;
  showLink?: boolean;
  linkLabel?: string;
  showButtonLabel?: string;
  showButton?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
}

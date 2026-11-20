import type { ReactNode } from 'react';

export type ScrollDirection = 'vertical' | 'horizontal' | 'both';

export interface IScrollableProps {
  children: ReactNode;
  direction?: ScrollDirection;
  maxHeight?: number | string;
  maxWidth?: number | string;
  className?: string;
}

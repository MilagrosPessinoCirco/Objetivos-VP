import * as React from 'react';
import styles from './Scrollable.module.scss';
import type { IScrollableProps } from './Scrollable.types';

export const Scrollable: React.FC<IScrollableProps> = ({
  children,
  direction = 'vertical',
  maxHeight,
  maxWidth,
  className,
}) => (
  <div
    className={`${styles.scrollable} ${styles[direction]} ${className || ''}`}
    style={{ maxHeight, maxWidth }}
  >
    {children}
  </div>
);

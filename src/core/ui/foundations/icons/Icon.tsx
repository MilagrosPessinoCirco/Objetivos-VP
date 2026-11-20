import * as React from 'react';
import styles from './Icon.module.scss';
import { iconSizes } from './sizes';
import type { IIconProps } from './Icon.types';

export const Icon: React.FC<IIconProps> = ({
  src,
  size = 'md',
  variant = 'outline',
  alt = '',
  className,
}) => (
  <img
    className={`${styles.icon} ${className || ''}`}
    src={src}
    alt={alt}
    data-icon-variant={variant}
    style={{ '--ds-icon-size': iconSizes[size] } as React.CSSProperties}
  />
);

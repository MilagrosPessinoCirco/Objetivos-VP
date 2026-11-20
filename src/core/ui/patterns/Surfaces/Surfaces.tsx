import * as React from 'react';
import styles from './Surfaces.module.scss';
import type { ISurfaceProps } from './Surfaces.types';

const paddingMap = {
  none: styles.none,
  compact: styles.compact,
  comfortable: styles.comfortable,
  spacious: styles.spacious,
};

const variantMap = {
  default: styles.default,
  subtle: styles.subtle,
  raised: styles.raised,
  outline: styles.outline,
  dark: styles.dark,
};

export const Surface: React.FC<ISurfaceProps> = ({
  children,
  variant = 'default',
  padding = 'comfortable',
  borderRadius = 8,
  darkMode = false,
  header,
  footer,
  className,
  style,
}) => (
  <section
    className={`${styles.surface} ${variantMap[variant]} ${paddingMap[padding]} ${darkMode ? styles.darkMode : ''} ${className || ''}`}
    style={{ ...style, borderRadius }}
  >
    {header && <div className={styles.header}>{header}</div>}
    <div className={styles.body}>{children}</div>
    {footer && <div className={styles.footer}>{footer}</div>}
  </section>
);

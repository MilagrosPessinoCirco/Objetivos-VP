import * as React from 'react';
import { DefaultButton, PrimaryButton } from '@fluentui/react';
import styles from './Footer.module.scss';
import type { IFooterProps } from './Footer.types';

export const Footer: React.FC<IFooterProps> = ({
  primaryText = 'Aceptar',
  secondaryText = 'Cancelar',
  primaryAction,
  secondaryAction,
  darkMode = false,
  children,
  onPrimaryClick,
  onSecondaryClick,
  className,
}) => (
  <footer className={`${styles.footer} ${darkMode ? styles.dark : ''} ${className || ''}`}>
    <div className={styles.buttons}>
      {secondaryAction || (
        <DefaultButton className={styles.secondaryAction} onClick={onSecondaryClick}>{secondaryText}</DefaultButton>
      )}
      {primaryAction || (
        <PrimaryButton className={styles.primaryAction} onClick={onPrimaryClick}>{primaryText}</PrimaryButton>
      )}
      {children && <div className={styles.slot}>{children}</div>}
    </div>
  </footer>
);

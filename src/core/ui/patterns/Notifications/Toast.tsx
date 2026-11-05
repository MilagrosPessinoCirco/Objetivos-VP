import * as React from 'react';
import styles from './MessageBar.module.scss';

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export interface IToastProps {
  title?: string;
  message: string;
  variant?: ToastVariant;
  darkMode?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  duration?: number;
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<IToastProps> = ({
  title,
  message,
  variant = 'info',
  darkMode = false,
  open,
  defaultOpen = true,
  duration,
  icon,
  onClose,
  className,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = open === undefined ? internalOpen : open;

  React.useEffect(() => {
    if (!isOpen || duration === undefined || duration <= 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      if (open === undefined) {
        setInternalOpen(false);
      }
      onClose?.();
    }, duration);

    return () => window.clearTimeout(timeoutId);
  }, [duration, isOpen, onClose, open]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`${styles.messageBar} ${styles[variant]} ${darkMode ? styles.dark : ''} ${className || ''}`}>
      <div className={styles.content}>
        <span className={styles.icon}>{icon || <span aria-hidden="true">•</span>}</span>
        <div className={styles.toastText}>
          {title && <strong className={styles.toastTitle}>{title}</strong>}
          <p className={styles.message}>{message}</p>
        </div>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar notificación">
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  );
};

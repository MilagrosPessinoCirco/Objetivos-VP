import * as React from 'react';
import { DefaultButton, Modal as FluentModal, PrimaryButton } from '@fluentui/react';
import styles from './Modal.module.scss';
import type { IModalProps } from './Modal.types';

export const Modal: React.FC<IModalProps> = ({
  open,
  title = 'Titulo',
  description = 'Do you want to send this message without a subject?',
  variant = 'default',
  darkMode = false,
  children,
  secondaryContent,
  primaryAction,
  secondaryAction,
  onClose,
  closeOnOverlayClick = true,
  className,
}) => {
  if (!open) {
    return null;
  }

  return (
    <FluentModal
      isOpen={open}
      isBlocking={!closeOnOverlayClick}
      isDarkOverlay
      onDismiss={() => onClose?.()}
      className={styles.fluentModal}
      containerClassName={styles.fluentModalContainer}
    >
      <section className={`${styles.modal} ${styles[variant]} ${darkMode ? styles.dark : ''} ${className || ''}`} role="dialog" aria-modal="true" aria-labelledby="ds-modal-title">
        <h2 id="ds-modal-title" className={styles.title}>{title}</h2>
        {variant !== 'twoSlots' && <p className={styles.description}>{description}</p>}
        {variant === 'twoSlots' && <div className={styles.slot}>{secondaryContent}</div>}
        {variant === 'twoSlots' && <div className={styles.slot}>{children}</div>}
        {variant === 'oneSlot' && <div className={styles.slot}>{children}</div>}
        <div className={styles.actions}>
          {primaryAction || <PrimaryButton className={styles.primaryAction} onClick={onClose}>Send</PrimaryButton>}
          {secondaryAction || <DefaultButton className={styles.secondaryAction} onClick={onClose}>Don't send</DefaultButton>}
        </div>
      </section>
    </FluentModal>
  );
};

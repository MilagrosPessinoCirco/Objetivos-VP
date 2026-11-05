import * as React from 'react';
import { DefaultButton, Panel as FluentPanel, PanelType, PrimaryButton } from '@fluentui/react';
import styles from './Panel.module.scss';
import type { IPanelProps } from './Panel.types';

export const Panel: React.FC<IPanelProps> = ({
  open,
  title = 'Título de panel',
  children,
  footerSlot,
  primaryAction,
  secondaryAction,
  onClose,
  className,
}) => {
  return (
    <FluentPanel
      isOpen={open}
      isLightDismiss
      isFooterAtBottom
      hasCloseButton
      headerText={title}
      closeButtonAriaLabel="Cerrar panel"
      type={PanelType.custom}
      customWidth="583px"
      className={`${styles.fluentPanel} ${className || ''}`}
      onDismiss={() => onClose?.()}
      onRenderFooterContent={() => (
        <div className={styles.actions}>
          {primaryAction || <PrimaryButton onClick={onClose}>Save</PrimaryButton>}
          {secondaryAction || <DefaultButton onClick={onClose}>Cancel</DefaultButton>}
          {footerSlot}
        </div>
      )}
    >
      <div className={styles.content}>{children}</div>
    </FluentPanel>
  );
};

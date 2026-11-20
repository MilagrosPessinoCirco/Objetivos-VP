import * as React from 'react';
import { MessageBar as FluentMessageBar, MessageBarType as FluentMessageBarType } from '@fluentui/react';
import styles from './MessageBar.module.scss';
import type { IMessageBarProps } from './MessageBar.types';

const fluentTypes: Record<NonNullable<IMessageBarProps['type']>, FluentMessageBarType> = {
  success: FluentMessageBarType.success,
  info: FluentMessageBarType.info,
  warning: FluentMessageBarType.warning,
  error: FluentMessageBarType.error,
  blocked: FluentMessageBarType.blocked,
  severeWarning: FluentMessageBarType.severeWarning,
};

const fluentIcons: Partial<Record<NonNullable<IMessageBarProps['type']>, string>> = {
  warning: 'Warning',
  error: 'ErrorBadge',
  blocked: 'Blocked2',
};

const fluentClasses: Record<NonNullable<IMessageBarProps['type']>, string> = {
  success: styles.fluentSuccess,
  info: styles.fluentInfo,
  warning: styles.fluentWarning,
  error: styles.fluentError,
  blocked: styles.fluentBlocked,
  severeWarning: styles.fluentSevereWarning,
};

export const MessageBar: React.FC<IMessageBarProps> = ({
  type = 'success',
  message,
  darkMode = false,
  open,
  defaultOpen = false,
  multiline = false,
  dismissible = true,
  actions,
  iconName,
  iconColor,
  onClose,
  onToggle,
  icon,
  className,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = open === undefined ? internalOpen : open;
  const isExpandable = type === 'blocked';

  const handleToggle = (nextOpen: boolean): void => {
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }
    onToggle?.(nextOpen);
  };

  return (
    <FluentMessageBar
      className={`${styles.fluentMessageBar} ${fluentClasses[type]} ${darkMode ? styles.fluentDark : ''} ${multiline ? styles.fluentMultiline : ''} ${isOpen ? styles.fluentOpen : ''} ${icon ? styles.fluentHasCustomIcon : ''} ${className || ''}`}
      messageBarType={fluentTypes[type || 'success']}
      messageBarIconProps={iconName || fluentIcons[type]
        ? { iconName: iconName || fluentIcons[type], style: iconColor ? { color: iconColor } : undefined }
        : undefined}
      dismissIconProps={{ iconName: 'Cancel' }}
      dismissButtonAriaLabel="Cerrar mensaje"
      onDismiss={dismissible ? () => onClose?.() : undefined}
      isMultiline={multiline}
      actions={actions ? <div className={styles.fluentActions}>{actions}</div> : undefined}
      truncated={isExpandable}
      showExpandButton={isExpandable}
      overflowButtonAriaLabel={isOpen ? 'Contraer mensaje' : 'Expandir mensaje'}
        expandButtonProps={{
          ariaLabel: isOpen ? 'Contraer mensaje' : 'Expandir mensaje',
          iconProps: { iconName: isOpen ? 'DoubleChevronUp' : 'DoubleChevronDown' },
          'aria-expanded': isOpen,
        }}
      onExpandButtonToggled={isExpandable ? handleToggle : undefined}
    >
      {icon ? (
        <span className={styles.fluentCustomContent}>
          <span className={styles.fluentCustomIcon}>{icon}</span>
          <span>{message}</span>
        </span>
      ) : message}
    </FluentMessageBar>
  );
};

import * as React from 'react';
import { Toggle } from '@fluentui/react';
import styles from './Switch.module.scss';
import type { ISwitchProps } from './Switch.types';

export const Switch: React.FC<ISwitchProps> = ({
  label,
  active,
  defaultActive = true,
  labelPosition = 'top',
  textOff = false,
  disabled = false,
  darkMode = false,
  onChange,
  className,
}) => {
  const [internalActive, setInternalActive] = React.useState(defaultActive);
  const isActive = active === undefined ? internalActive : active;
  const positionClass = labelPosition === 'top' ? styles.top : styles.inline;

  const toggle = (_ev: React.MouseEvent<HTMLElement>, checked?: boolean): void => {
    const nextValue = !!checked;
    if (active === undefined) {
      setInternalActive(nextValue);
    }
    onChange?.(nextValue);
  };

  const stateClasses = [isActive ? styles.active : '', disabled ? styles.disabled : '', darkMode ? styles.dark : ''].filter(Boolean).join(' ');

  const labelContent = label && <span className={styles.label}>{label}</span>;
  const control = (
    <Toggle
      checked={isActive}
      disabled={disabled}
      onChange={toggle}
      onText={!textOff ? 'SI' : undefined}
      offText={!textOff ? 'NO' : undefined}
      styles={{
        root: styles.toggleRoot,
        container: styles.toggleContainer,
        pill: `${styles.control} ${stateClasses}`,
        thumb: `${styles.thumb} ${stateClasses}`,
        text: styles.state,
      }}
    />
  );

  return (
    <div className={`${styles.switch} ${positionClass} ${darkMode ? styles.dark : ''} ${disabled ? styles.disabled : ''} ${className || ''}`}>
      {labelPosition === 'top' && labelContent}
      {labelPosition === 'inlineLeft' && <div className={styles.inline}>{control}{labelContent}</div>}
      {labelPosition === 'inlineRight' && <div className={styles.inline}>{labelContent}{control}</div>}
      {labelPosition === 'top' && <div className={styles.inline}>{control}</div>}
    </div>
  );
};


import * as React from 'react';
import { Checkbox as FluentCheckbox } from '@fluentui/react';
import styles from './Checkbox.module.scss';
import type { ICheckboxProps } from './Checkbox.types';

export const Checkbox = React.forwardRef<HTMLInputElement, ICheckboxProps>(({
  label,
  required = false,
  indeterminate = false,
  error = false,
  id,
  className,
  checked,
  defaultChecked,
  disabled,
  onChange,
  ...nativeInputProps
}, forwardedRef) => {
  const fieldRef = React.useRef<HTMLDivElement>(null);
  const controlClassName = indeterminate ? `${styles.control} ${styles.controlIndeterminate}` : styles.control;

  // Indeterminate is a display-only state: block the native toggle so it can't be selected/deselected.
  const blockIndeterminateToggle = (event: React.SyntheticEvent<HTMLElement>): void => {
    if (indeterminate) {
      event.preventDefault();
    }
  };

  React.useEffect(() => {
    const input = fieldRef.current ? fieldRef.current.querySelector('input') : null;
    if (typeof forwardedRef === 'function') {
      forwardedRef(input || null);
    } else if (forwardedRef) {
      forwardedRef.current = input;
    }

    return () => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(null);
      } else if (forwardedRef) {
        forwardedRef.current = null;
      }
    };
  }, [forwardedRef]);

  return (
    <FluentCheckbox
      ref={fieldRef}
      id={id}
      className={`${styles.checkboxField} ${error ? styles.error : ''} ${className || ''}`}
      required={required}
      indeterminate={indeterminate}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onChange={(event) => onChange?.(event as unknown as React.ChangeEvent<HTMLInputElement>)}
      inputProps={{
        ...nativeInputProps,
        onClick: blockIndeterminateToggle,
        onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
          if (indeterminate && (event.key === ' ' || event.key === 'Enter')) {
            event.preventDefault();
          }
        },
      }}
      onRenderLabel={() => (label === undefined ? null : (
        <span className={styles.text}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </span>
      ))}
      styles={{
        root: styles.root,
        checkbox: controlClassName,
        checkmark: styles.checkmark,
        label: styles.label,
      }}
    />
  );
});

Checkbox.displayName = 'Checkbox';

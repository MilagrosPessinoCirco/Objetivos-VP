import * as React from 'react';
import { SpinButton as FluentSpinButton } from '@fluentui/react';
import styles from './SpinButton.module.scss';
import type { ISpinButtonProps } from './SpinButton.types';

let generatedSpinButtonId = 0;

export const SpinButton = React.forwardRef<HTMLInputElement, ISpinButtonProps>(({
  label,
  required = false,
  errorMessage,
  disabled = false,
  readOnly = false,
  id,
  className,
  step = 1,
  min,
  max,
  defaultValue,
  value,
  onChange,
  ...inputProps
}, ref) => {
  const [generatedId] = React.useState(() => {
    generatedSpinButtonId += 1;
    return `ds-spin-button-${generatedSpinButtonId}`;
  });
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const fieldRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const input = fieldRef.current ? fieldRef.current.querySelector('input') : null;
    if (typeof ref === 'function') {
      ref(input || null);
    } else if (ref) {
      ref.current = input;
    }

    return () => {
      if (typeof ref === 'function') {
        ref(null);
      } else if (ref) {
        ref.current = null;
      }
    };
  }, [ref]);
  const stateClass = errorMessage
    ? styles.error
    : disabled
      ? styles.disabled
      : readOnly
        ? styles.readOnly
        : '';

  return (
    <div className={`${styles.spinButtonField} ${stateClass} ${className || ''}`}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          <span>{label}</span>
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <FluentSpinButton
        {...inputProps}
        ref={fieldRef}
        id={inputId}
        className={styles.fluentSpinButton}
        inputProps={{
          ...inputProps,
          id: inputId,
          'aria-invalid': Boolean(errorMessage),
          'aria-describedby': errorMessage ? errorId : undefined,
          readOnly,
        }}
        min={min === undefined || min === '' ? undefined : Number(min)}
        max={max === undefined || max === '' ? undefined : Number(max)}
        step={step}
        defaultValue={defaultValue === undefined ? undefined : String(defaultValue)}
        value={value === undefined || Array.isArray(value) ? undefined : String(value)}
        disabled={disabled}
        onChange={(event, newValue) => onChange?.(event as React.ChangeEvent<HTMLInputElement>)}
        incrementButtonAriaLabel="Incrementar valor"
        decrementButtonAriaLabel="Decrementar valor"
        incrementButtonIcon={{ iconName: 'ChevronUp' }}
        decrementButtonIcon={{ iconName: 'ChevronDown' }}
      />
      {errorMessage && <span id={errorId} className={styles.errorMessage}>{errorMessage}</span>}
    </div>
  );
});

SpinButton.displayName = 'SpinButton';

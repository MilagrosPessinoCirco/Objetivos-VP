import * as React from 'react';
import { TextField } from '@fluentui/react';
import styles from './Input.module.scss';
import type { IInputProps } from './Input.types';

let generatedInputId = 0;

export const Input = React.forwardRef<HTMLInputElement, IInputProps>(({
  label,
  required = false,
  errorMessage,
  iconLeft,
  iconRight,
  disabled = false,
  readOnly = false,
  id,
  className,
  defaultValue,
  value,
  onChange,
  ...inputProps
}, ref) => {
  const [generatedId] = React.useState(() => {
    generatedInputId += 1;
    return `ds-input-${generatedInputId}`;
  });
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const stateClass = errorMessage
    ? styles.error
    : disabled
      ? styles.disabled
      : readOnly
        ? styles.readOnly
        : '';

  return (
    <div className={`${styles.inputField} ${stateClass} ${className || ''}`}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          <span>{label}</span>
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.control}>
        <TextField
          {...inputProps}
          defaultValue={defaultValue === undefined ? undefined : String(defaultValue)}
          value={value === undefined ? undefined : String(value)}
          onChange={(event) => onChange?.(event as React.ChangeEvent<HTMLInputElement>)}
          id={inputId}
          className={styles.textField}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? errorId : undefined}
          styles={{
            root: styles.textFieldRoot,
            wrapper: styles.textFieldWrapper,
            fieldGroup: styles.textFieldGroup,
            field: styles.input,
            prefix: styles.icon,
            suffix: styles.icon,
            errorMessage: styles.fluentErrorMessage,
          }}
          onRenderInput={(inputProps) => <input {...inputProps} ref={ref} />}
          onRenderPrefix={iconLeft ? () => <span className={styles.icon}>{iconLeft}</span> : undefined}
          onRenderSuffix={iconRight ? () => <span className={styles.icon}>{iconRight}</span> : undefined}
        />
      </div>
      {errorMessage && <span id={errorId} className={styles.errorMessage}>{errorMessage}</span>}
    </div>
  );
});

Input.displayName = 'Input';

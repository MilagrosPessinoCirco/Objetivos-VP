import * as React from 'react';
import { TextField } from '@fluentui/react';
import styles from './Multiline.module.scss';
import type { IMultilineProps } from './Multiline.types';

let generatedMultilineId = 0;

export const Multiline = React.forwardRef<HTMLTextAreaElement, IMultilineProps>(({
  label,
  required = false,
  errorMessage,
  disabled = false,
  readOnly = false,
  id,
  className,
  defaultValue,
  value,
  onChange,
  ...textareaProps
}, ref) => {
  const [generatedId] = React.useState(() => {
    generatedMultilineId += 1;
    return `ds-multiline-${generatedMultilineId}`;
  });
  const textareaId = id || generatedId;
  const errorId = `${textareaId}-error`;
  const fieldRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const textarea = fieldRef.current ? fieldRef.current.querySelector('textarea') : null;
    if (typeof ref === 'function') {
      ref(textarea || null);
    } else if (ref) {
      ref.current = textarea;
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
    <div className={`${styles.multilineField} ${stateClass} ${className || ''}`}>
      {label && (
        <label className={styles.label} htmlFor={textareaId}>
          <span>{label}</span>
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <TextField
        {...textareaProps}
        elementRef={fieldRef}
        id={textareaId}
        className={styles.textField}
        multiline
        resizable
        defaultValue={defaultValue === undefined || Array.isArray(defaultValue) ? undefined : String(defaultValue)}
        value={value === undefined || Array.isArray(value) ? undefined : String(value)}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? errorId : undefined}
        onChange={(event) => onChange?.(event as React.ChangeEvent<HTMLTextAreaElement>)}
        styles={{
          root: styles.textFieldRoot,
          fieldGroup: styles.textFieldGroup,
          field: styles.textarea,
          errorMessage: styles.fluentErrorMessage,
        }}
      />
      {errorMessage && <span id={errorId} className={styles.errorMessage}>{errorMessage}</span>}
    </div>
  );
});

Multiline.displayName = 'Multiline';

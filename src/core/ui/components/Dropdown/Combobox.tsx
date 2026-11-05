import * as React from 'react';
import { ComboBox as FluentComboBox } from '@fluentui/react';
import styles from './Combobox.module.scss';
import type { IComboboxProps } from './Combobox.types';

let generatedComboboxId = 0;

function normalizeValue(value: string | string[] | undefined, multiple: boolean): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : (multiple ? [] : []);
}

export const Combobox: React.FC<IComboboxProps> = ({
  label,
  options,
  placeholder = 'Seleccionar',
  value,
  defaultValue,
  multiple = false,
  required = false,
  errorMessage,
  disabled = false,
  darkMode = false,
  onChange,
  className,
}) => {
  const [generatedId] = React.useState(() => {
    generatedComboboxId += 1;
    return `ds-combobox-${generatedComboboxId}`;
  });
  const comboboxId = generatedId;
  const [internalValue, setInternalValue] = React.useState<string | string[]>(defaultValue || (multiple ? [] : ''));
  const currentValue = value === undefined ? internalValue : value;
  const selectedKeys = normalizeValue(currentValue, multiple);
  const fluentOptions = options.map((option) => ({ key: option.key, text: option.text, disabled: option.disabled }));

  const handleOptionChange = (option?: { key: string | number; selected?: boolean }): void => {
    if (!option) {
      return;
    }
    const nextValue = multiple
      ? option.selected
        ? [...selectedKeys, String(option.key)]
        : selectedKeys.filter((key) => key !== String(option.key))
      : String(option.key);
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  return (
    <div className={`${styles.combobox} ${darkMode ? styles.dark : ''} ${className || ''}`}>
      <FluentComboBox
        id={comboboxId}
        label={label}
        required={required}
        placeholder={placeholder}
        options={fluentOptions}
        multiSelect={multiple}
        selectedKey={!multiple ? selectedKeys[0] : undefined}
        disabled={disabled}
        errorMessage={errorMessage}
        allowFreeform
        useComboBoxAsMenuWidth
        onChange={(_, option) => handleOptionChange(option)}
        onItemClick={(_, option) => handleOptionChange(option)}
        styles={{
          container: styles.fluentContainer,
          label: styles.label,
          root: darkMode ? styles.darkTrigger : styles.trigger,
          rootError: styles.triggerError,
          rootFocused: styles.triggerFocused,
          rootHovered: styles.triggerHovered,
          rootDisabled: styles.triggerDisabled,
          input: darkMode ? styles.darkValue : styles.value,
          errorMessage: styles.fluentErrorMessage,
          optionsContainerWrapper: darkMode ? styles.darkMenu : styles.menu,
          callout: styles.callout,
        }}
        comboBoxOptionStyles={darkMode ? {
          root: styles.darkOption,
          rootHovered: styles.darkOptionHovered,
          rootFocused: styles.darkOptionFocused,
          rootDisabled: styles.darkOptionDisabled,
        } : undefined}
        buttonIconProps={{ iconName: 'ChevronDown' }}
        caretDownButtonStyles={{ root: darkMode ? styles.darkCaretDownButton : styles.caretDownButton }}
      />
      {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
    </div>
  );
};

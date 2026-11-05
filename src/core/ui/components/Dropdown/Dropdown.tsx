import * as React from 'react';
import { Dropdown as FluentDropdown } from '@fluentui/react';
import styles from './Dropdown.module.scss';
import type { IDropdownProps } from './Dropdown.types';

const chevronDefault: string = require('./assets/chevron-default.svg');
const chevronMultiselect: string = require('./assets/chevron-multiselect.svg');
const chevronError: string = require('./assets/chevron-error.svg');
let generatedDropdownId = 0;

export const Dropdown: React.FC<IDropdownProps> = ({
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
  className,
  onChange,
}) => {
  const [generatedId] = React.useState(() => {
    generatedDropdownId += 1;
    return `ds-dropdown-${generatedDropdownId}`;
  });
  const [internalValue, setInternalValue] = React.useState<string | string[]>(defaultValue || (multiple ? [] : ''));
  const currentValue = value === undefined ? internalValue : value;
  const selectedKeys = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : [];
  const fluentOptions = options.map((option) => ({ key: option.key, text: option.text, disabled: option.disabled }));
  const chevron = errorMessage ? chevronError : multiple ? chevronMultiselect : chevronDefault;

  return (
    <div className={`${styles.dropdown} ${darkMode ? styles.dark : ''} ${className || ''}`}>
      <FluentDropdown
        id={generatedId}
        label={label}
        required={required}
        placeholder={placeholder}
        options={fluentOptions}
        multiSelect={multiple}
        selectedKeys={multiple ? selectedKeys : undefined}
        selectedKey={!multiple ? selectedKeys[0] : undefined}
        disabled={disabled}
        errorMessage={errorMessage}
        onChange={(_, option) => {
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
        }}
        onRenderCaretDown={() => <img className={styles.chevron} src={chevron} alt="" />}
        styles={{
          root: styles.fluentRoot,
          label: styles.label,
          dropdown: styles.fluentDropdown,
          title: darkMode ? styles.darkTrigger : styles.trigger,
          caretDownWrapper: styles.caretDownWrapper,
          caretDown: styles.caretDown,
          errorMessage: styles.fluentErrorMessage,
          dropdownItemsWrapper: darkMode ? styles.darkMenu : styles.menu,
          dropdownItem: darkMode ? styles.darkOption : styles.option,
          dropdownItemSelected: darkMode ? styles.darkOptionSelected : styles.optionSelected,
          dropdownItemDisabled: darkMode ? styles.darkOptionDisabled : styles.optionDisabled,
        }}
      />
      {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
    </div>
  );
};

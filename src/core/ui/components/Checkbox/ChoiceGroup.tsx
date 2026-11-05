import * as React from 'react';
import { ChoiceGroup as FluentChoiceGroup } from '@fluentui/react';
import type { IChoiceGroupOption, IChoiceGroupOptionProps } from '@fluentui/react';
import styles from './ChoiceGroup.module.scss';
import type { IChoiceGroupProps, IChoiceOption } from './ChoiceGroup.types';

export const ChoiceGroup: React.FC<IChoiceGroupProps> = ({
  name,
  options,
  label,
  value,
  defaultValue,
  required = false,
  disabled = false,
  darkMode = false,
  error = false,
  onChange,
  className,
}) => {
  const renderField = (fieldProps?: IChoiceGroupOption & IChoiceGroupOptionProps): React.ReactElement | null => {
    if (!fieldProps) {
      return null;
    }
    const option = options.find((item) => item.value === fieldProps.itemKey);
    if (!option) {
      return null;
    }

    if (option.icon) {
      return (
        <label htmlFor={fieldProps.id} className={`${styles.option} ${styles.iconOption}`}>
          <span className={styles.icon}>{option.icon}</span>
          <span className={styles.label}>{option.label}{required && <span className={styles.required}>*</span>}</span>
          <span className={styles.control} aria-hidden="true" />
        </label>
      );
    }

    return (
      <label htmlFor={fieldProps.id} className={styles.option}>
        <span className={styles.control} aria-hidden="true" />
        <span className={styles.label}>{option.label}{required && <span className={styles.required}>*</span>}</span>
      </label>
    );
  };

  const fluentOptions: IChoiceGroupOption[] = options.map((option: IChoiceOption) => ({
    key: option.value,
    text: option.label,
    disabled: option.disabled,
    onRenderField: renderField,
  }));

  return (
    <div className={`${styles.group} ${darkMode ? styles.darkMode : ''} ${error ? styles.error : ''} ${className || ''}`}>
      <FluentChoiceGroup
        name={name}
        label={label}
        required={required}
        disabled={disabled}
        options={fluentOptions}
        selectedKey={value}
        defaultSelectedKey={defaultValue}
        onChange={(_, option) => option && onChange?.(String(option.key))}
        styles={{
          label: styles.groupLabel,
          flexContainer: styles.options,
        }}
      />
      {error && <span className={styles.errorMessage}>Seleccioná una opción.</span>}
    </div>
  );
};

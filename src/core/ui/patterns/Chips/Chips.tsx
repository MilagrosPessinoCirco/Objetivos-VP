import * as React from 'react';
import { ActionButton, IconButton } from '@fluentui/react';
import { FigmaIcon } from '../../foundations/icons';
import styles from './Chips.module.scss';
import type { IChipItem, IChipProps, IChipsProps } from './Chips.types';

const getColorClass = (color: IChipProps['color'] = 'neutral'): string => {
  const colorClasses: Record<NonNullable<IChipProps['color']>, string> = {
    neutral: styles.neutral,
    brand: styles.brand,
    secondary: styles.secondary,
    success: styles.success,
    warning: styles.warning,
    danger: styles.danger,
  };

  return colorClasses[color];
};

const variantClasses: Record<NonNullable<IChipProps['variant']>, string> = {
  filled: styles.filled,
  outline: styles.outline,
  subtle: styles.subtle,
};

export const Chip: React.FC<IChipProps> = ({
  label,
  selected = false,
  disabled = false,
  variant = 'subtle',
  size = 'medium',
  color = 'neutral',
  stroke = variant === 'outline',
  clickable = true,
  darkMode = false,
  icon,
  trailingIcon,
  removable = false,
  onRemove,
  className,
  type = 'button',
  onClick,
  ...rest
}) => {
  const handleRemove = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    onRemove?.();
  };

  const removeIconSize = size === 'small' ? 'xs' : size === 'medium' ? 'sm' : 'md';

  const chipClassName = [
    styles.chip,
    variantClasses[variant],
    styles[size],
    getColorClass(color),
    darkMode ? styles.dark : '',
    selected ? styles.selected : '',
    stroke ? styles.stroke : '',
    !clickable ? styles.nonClickable : '',
    disabled ? styles.disabled : '',
    className || '',
  ].join(' ');

  const chipContent = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
      {!removable && trailingIcon && <span className={styles.trailingIcon}>{trailingIcon}</span>}
    </>
  );

  const removeControl = removable && (
    <IconButton
      className={styles.removeButton}
      ariaLabel={`Remove ${label}`}
      disabled={disabled}
      onClick={handleRemove}
      onRenderIcon={() => <FigmaIcon name="closeCircle" size={removeIconSize} />}
    />
  );

  return (
    <span className={`${styles.chipWrapper} ${disabled ? styles.disabled : ''}`}>
      {clickable ? (
      <ActionButton
        type={type}
        className={chipClassName}
        toggle
        checked={selected}
        disabled={disabled}
        onClick={onClick}
        {...rest}
      >
        {chipContent}
        {removable && (
          <span className={styles.removeButton} onClick={handleRemove} aria-hidden="true">
            <FigmaIcon name="closeCircle" size={removeIconSize} />
          </span>
        )}
      </ActionButton>
      ) : (
        <span className={chipClassName} aria-disabled={disabled || undefined}>
          {chipContent}
          {removeControl}
        </span>
      )}
    </span>
  );
};

export const Chips: React.FC<IChipsProps> = ({
  items,
  value,
  defaultValue = [],
  multiSelect = true,
  variant = 'subtle',
  size = 'medium',
  color = 'neutral',
  stroke,
  clickable = true,
  darkMode = false,
  disabled = false,
  removable = false,
  onChange,
  onSelect,
  className,
}) => {
  const [internalValue, setInternalValue] = React.useState<string[]>(
    defaultValue.length > 0 ? defaultValue : items.filter((item) => item.selected).map((item) => item.key)
  );

  const selectedKeys = value === undefined ? internalValue : value;

  const updateSelection = (nextSelection: string[]): void => {
    if (value === undefined) {
      setInternalValue(nextSelection);
    }
    onChange?.(nextSelection);
  };

  const handleSelect = (item: IChipItem): void => {
    if (item.disabled || disabled) {
      return;
    }

    const isSelected = selectedKeys.indexOf(item.key) >= 0;
    const nextSelection = multiSelect
      ? isSelected
        ? selectedKeys.filter((key) => key !== item.key)
        : [...selectedKeys, item.key]
      : [item.key];

    updateSelection(nextSelection);
    onSelect?.(item, nextSelection);
  };

  const handleRemove = (item: IChipItem): void => {
    const nextSelection = selectedKeys.filter((key) => key !== item.key);
    updateSelection(nextSelection);
    item.onRemove?.(item.key);
  };

  return (
    <div className={`${styles.chips} ${darkMode ? styles.dark : ''} ${className || ''}`}>
      {items.map((item) => {
        const isSelected = selectedKeys.indexOf(item.key) >= 0;
        return (
          <Chip
            key={item.key}
            label={item.label}
            selected={isSelected}
            disabled={item.disabled || disabled}
            variant={variant}
            size={size}
            color={color}
            stroke={stroke}
            clickable={clickable}
            darkMode={darkMode}
            icon={item.icon}
            trailingIcon={item.trailingIcon}
            removable={removable}
            aria-label={item.ariaLabel || item.label}
            onClick={() => handleSelect(item)}
            onRemove={() => handleRemove(item)}
            className={item.disabled ? styles.disabled : undefined}
          />
        );
      })}
    </div>
  );
};

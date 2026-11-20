import * as React from 'react';
import { FocusZoneDirection, Pivot, PivotItem } from '@fluentui/react';
import styles from './Tabs.module.scss';
import type { ITabsProps, TabsStyle } from './Tabs.types';

const variantClasses: Record<TabsStyle, string> = {
  transparent: styles.transparent,
  subtle: styles.subtle,
  filled: styles.filled,
};

export const Tabs: React.FC<ITabsProps> = ({
  items,
  value,
  defaultValue,
  orientation = 'horizontal',
  size = 'medium',
  variant = 'transparent',
  circular = false,
  ariaLabel,
  onChange,
  className,
}) => {
  // Figma solo define "Filled circular": el estilo filled siempre adopta la forma circular,
  // y un tablist circular usa "Subtle circular" cuando el estilo es transparente.
  const isCircular = circular || variant === 'filled';
  const resolvedVariant: TabsStyle = isCircular && variant === 'transparent' ? 'subtle' : variant;

  const rootClassName = [
    styles.tabs,
    styles[orientation],
    size === 'small' ? styles.small : '',
    variantClasses[resolvedVariant],
    isCircular ? styles.circular : '',
    className || '',
  ].filter(Boolean).join(' ');

  return (
    <Pivot
      headersOnly
      className={rootClassName}
      aria-label={ariaLabel}
      selectedKey={value}
      defaultSelectedKey={defaultValue}
      focusZoneProps={{
        direction: orientation === 'vertical' ? FocusZoneDirection.vertical : FocusZoneDirection.horizontal,
      }}
      onLinkClick={(item) => {
        const itemKey = item?.props.itemKey;
        if (itemKey) onChange?.(itemKey);
      }}
    >
      {items.map((item) => (
        <PivotItem
          key={item.key}
          itemKey={item.key}
          headerText={item.label}
          headerButtonProps={{ disabled: item.disabled }}
          onRenderItemLink={() => (
            <span className={styles.linkContent}>
              {item.icon && <span className={styles.icon}>{item.icon}</span>}
              {item.label && <span className={styles.label}>{item.label}</span>}
            </span>
          )}
        />
      ))}
    </Pivot>
  );
};

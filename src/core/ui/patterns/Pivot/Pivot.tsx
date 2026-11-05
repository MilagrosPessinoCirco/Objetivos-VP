import * as React from 'react';
import { Pivot as FluentPivot, PivotItem } from '@fluentui/react';
import styles from './Pivot.module.scss';
import type { IPivotProps } from './Pivot.types';

// Inline Figma placeholder so the tab icon can follow each state color via currentColor.
const placeholderIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14ZM8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C10.7614 3 13 5.23858 13 8C13 10.7614 10.7614 13 8 13Z" fill="currentColor" />
  </svg>
);

export const Pivot: React.FC<IPivotProps> = ({
  items,
  value,
  defaultValue,
  darkMode = false,
  ariaLabel,
  onChange,
  className,
}) => {
  const hasContent = items.some((item) => item.content !== undefined);

  return (
    <FluentPivot
      className={`${styles.pivot} ${darkMode ? styles.dark : ''} ${className || ''}`}
      headersOnly={!hasContent}
      aria-label={ariaLabel}
      selectedKey={value}
      defaultSelectedKey={defaultValue}
      styles={{ itemContainer: styles.panel }}
      onLinkClick={(item) => {
        const itemKey = item?.props.itemKey;
        if (itemKey) onChange?.(itemKey);
      }}
    >
      {items.map((item) => {
        const icon = item.icon === undefined ? placeholderIcon : item.icon;
        return (
          <PivotItem
            key={item.key}
            itemKey={item.key}
            headerText={item.label}
            onRenderItemLink={() => (
              <span className={styles.linkContent}>
                {icon && <span className={styles.icon}>{icon}</span>}
                <span className={styles.label}>{item.label}</span>
              </span>
            )}
          >
            {item.content}
          </PivotItem>
        );
      })}
    </FluentPivot>
  );
};

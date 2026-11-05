import * as React from 'react';
import { CommandBarButton, DirectionalHint } from '@fluentui/react';
import type { IContextualMenuProps } from '@fluentui/react';
import styles from './CommandBar.module.scss';
import type { ICommandBarProps, ICommandBarItem } from './CommandBar.types';

const defaultIcon: string = require('./assets/placeholder.svg');
const disabledIcon: string = require('./assets/placeholder-disabled.svg');
const disabledDarkIcon: string = require('./assets/placeholder-disabled-dark.svg');
const chevronIcon: string = require('./assets/chevron.svg');
const chevronWhiteIcon: string = require('./assets/chevron-white.svg');

// Inline Figma placeholder so the submenu icon can follow each state color via currentColor.
const menuPlaceholderIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14ZM8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C10.7614 3 13 5.23858 13 8C13 10.7614 10.7614 13 8 13Z" fill="currentColor" />
  </svg>
);

export const CommandBar: React.FC<ICommandBarProps> = ({
  items,
  darkMode = false,
  className,
}) => {
  const [openKey, setOpenKey] = React.useState<string | null>(null);
  const barRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!openKey) {
      return undefined;
    }

    const handleDocumentMouseDown = (event: MouseEvent): void => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setOpenKey(null);
      }
    };
    const handleDocumentKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpenKey(null);
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [openKey]);

  const renderItem = (item: ICommandBarItem): React.ReactElement => {
    const menuProps: IContextualMenuProps | undefined = item.menuItems ? {
      className: `${styles.contextMenu} ${darkMode ? styles.contextMenuDark : ''}`,
      calloutProps: { className: styles.contextMenuCallout },
      directionalHint: DirectionalHint.bottomLeftEdge,
      isBeakVisible: false,
      gapSpace: 0,
      items: item.menuItems.map((menuItem) => ({
        key: menuItem.key,
        text: menuItem.label,
        disabled: menuItem.disabled,
        onClick: () => { menuItem.onClick?.(); },
        onRenderIcon: () => <span className={styles.menuItemIcon}>{menuItem.icon || menuPlaceholderIcon}</span>,
      })),
    } : undefined;
    const hasMenu = Boolean(item.menu || item.menuItems);

    return (
    <div className={styles.item} key={item.key}>
      <CommandBarButton
        className={`${styles.button} ${item.menu && openKey === item.key ? styles.pressed : ''}`}
        text={item.label}
        disabled={item.disabled}
        menuProps={menuProps}
        aria-haspopup={item.menu ? true : undefined}
        aria-expanded={item.menu ? openKey === item.key : undefined}
        aria-controls={item.menu ? `ds-command-menu-${item.key}` : undefined}
        onClick={() => {
          item.onClick?.();
          if (item.menu) {
            setOpenKey(openKey === item.key ? null : item.key);
          }
        }}
        onRenderIcon={() => (
          <span className={styles.icon}>
            {item.icon && !item.disabled
              ? item.icon
              : <img src={item.disabled ? darkMode ? disabledDarkIcon : disabledIcon : defaultIcon} alt="" />}
          </span>
        )}
        onRenderMenuIcon={hasMenu ? () => <img className={styles.chevron} src={darkMode ? chevronWhiteIcon : chevronIcon} alt="" /> : undefined}
      />
      {item.menu && openKey === item.key && (
        <div id={`ds-command-menu-${item.key}`} className={styles.menu}>
          {item.menu}
        </div>
      )}
    </div>
    );
  };

  return <nav ref={barRef} className={`${styles.commandBar} ${darkMode ? styles.dark : ''} ${className || ''}`} aria-label="Barra de comandos">{items.map(renderItem)}</nav>;
};

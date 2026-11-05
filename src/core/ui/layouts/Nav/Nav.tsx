import * as React from 'react';
import { IconButton, Nav as FluentNav } from '@fluentui/react';
import type { INavLink, INavLinkGroup } from '@fluentui/react';
import styles from './Nav.module.scss';
import type { INavItem, INavProps } from './Nav.types';

export const Nav: React.FC<INavProps> = ({
  items,
  title = 'Menu',
  showHeader = true,
  darkMode = false,
  open = true,
  selectedKey,
  onClose,
  onItemClick,
  className,
}) => {
  if (!open) {
    return null;
  }

  const itemsByKey: Record<string, INavItem> = {};
  const toLink = (item: INavItem): INavLink => {
    itemsByKey[item.key] = item;
    return {
      key: item.key,
      name: item.label,
      url: '#',
      disabled: item.status === 'disabled',
      isExpanded: item.status === 'open',
      links: item.children?.map(toLink),
      'data-nav-status': item.status || 'default'
    };
  };
  const groups: INavLinkGroup[] = [{ links: items.map(toLink) }];
  const activeKey = selectedKey || items.find((item) => item.status === 'active')?.key;

  const renderLink = (link?: INavLink): React.ReactElement | null => {
    if (!link) return null;
    return (
      <span className={styles.linkContent}>
        {link.reactIcon && (!link.links || link.links.length === 0) && <span className={styles.icon}>{link.reactIcon}</span>}
        <span className={styles.itemText}>{link.name}</span>
      </span>
    );
  };

  return (
    <aside className={`${styles.panel} ${darkMode ? styles.dark : ''} ${items.some((item) => item.status === 'hover') ? styles.hoverPreview : ''} ${className || ''}`}>
      {showHeader && (
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <IconButton
            className={styles.close}
            ariaLabel="Cerrar menú"
            onClick={onClose}
            iconProps={{ iconName: 'Cancel', className: styles.icon }}
          />
        </div>
      )}
      <FluentNav
        className={styles.list}
        ariaLabel={title}
        groups={groups}
        selectedKey={selectedKey}
        initialSelectedKey={activeKey}
        onRenderLink={renderLink}
        onLinkClick={(_event, link) => {
          const item = link?.key ? itemsByKey[link.key] : undefined;
          if (item) onItemClick?.(item);
        }}
        onLinkExpandClick={(_event, link) => {
          const item = link?.key ? itemsByKey[link.key] : undefined;
          if (item) onItemClick?.(item);
        }}
      />
    </aside>
  );
};

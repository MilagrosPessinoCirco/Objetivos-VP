import * as React from 'react';
import { Icon } from '@fluentui/react';
import styles from './EmptyState.module.scss';
import type { IEmptyStateProps } from './EmptyState.types';

export const EmptyState: React.FC<IEmptyStateProps> = ({
  title = 'No hay contenido disponible',
  description = 'Prueba con otro filtro o vuelve más tarde.',
  actionLabel = 'Ver más',
  icon,
  action,
  darkMode = false,
  className,
  onAction,
}) => (
  <section className={`${styles.emptyState} ${darkMode ? styles.dark : ''} ${className || ''}`}>
    <div className={styles.iconWrap} aria-hidden="true">
      {icon || <Icon iconName="Search" className={styles.icon} />}
    </div>
    <h3 className={styles.title}>{title}</h3>
    <p className={styles.description}>{description}</p>
    {action || (
      <button type="button" className={styles.action} onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </section>
);

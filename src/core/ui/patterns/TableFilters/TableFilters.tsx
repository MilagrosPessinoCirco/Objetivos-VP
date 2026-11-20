import * as React from 'react';
import { FigmaIcon } from '../../foundations/icons';
import styles from './TableFilters.module.scss';
import type { ITableFiltersProps } from './TableFilters.types';

export const TableFilters: React.FC<ITableFiltersProps> = ({
  title = 'Título de la sección',
  info = 'Podés filtrar por fechas para comenzar.',
  showTitle = true,
  showBack = false,
  backLabel = 'Volver',
  onBack,
  children,
  onReload,
  onApply,
  darkMode = false,
  className,
}) => (
  <div className={`${styles.tableFilters} ${darkMode ? styles.dark : ''} ${className || ''}`}>
    {showTitle && (
      <div className={styles.title}>
        {showBack && (
          <button type="button" className={styles.backButton} onClick={onBack}>
            <FigmaIcon name="arrowCircle" size="lg" />
            <span>{backLabel}</span>
          </button>
        )}
        <div className={styles.titleText}>
          <p className={styles.titleLabel}>{title}</p>
          <div className={styles.info}>
            <FigmaIcon name="info" size="xs" />
            <span className={styles.infoText}>{info}</span>
          </div>
        </div>
      </div>
    )}
    <div className={styles.container}>
      {children}
      <button type="button" className={styles.actionButton} onClick={onReload} aria-label="Recargar">
        <FigmaIcon name="reloadPrimary" size="sm" />
      </button>
      <button type="button" className={styles.actionButton} onClick={onApply} aria-label="Filtrar">
        <FigmaIcon name="filterPrimary" size="sm" />
      </button>
    </div>
  </div>
);

import * as React from 'react';
import { Dropdown } from '../../components/Dropdown';
import { FigmaIcon } from '../../foundations/icons';
import styles from './Filters.module.scss';
import type { FilterValues, IFiltersProps } from './Filters.types';

export const Filters: React.FC<IFiltersProps> = ({
  title = 'Título de la sección',
  helperText = 'Podés filtrar por fechas para comenzar.',
  filters,
  values,
  defaultValues = {},
  darkMode = false,
  onChange,
  onApply,
  onReset,
  applyIcon = <FigmaIcon name="filterPrimary" size="sm" />,
  resetIcon = <FigmaIcon name="reloadPrimary" size="sm" />,
  className,
}) => {
  const [internalValues, setInternalValues] = React.useState<FilterValues>(defaultValues);
  const currentValues = values || internalValues;

  const handleChange = (key: string, value: string): void => {
    const nextValues = { ...currentValues, [key]: value };
    if (!values) {
      setInternalValues(nextValues);
    }
    onChange?.(key, value, nextValues);
  };

  const handleReset = (): void => {
    if (!values) {
      setInternalValues({});
    }
    onReset?.();
  };

  return (
    <section className={`${styles.filters} ${darkMode ? styles.dark : ''} ${className || ''}`}>
      <div className={styles.heading}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.helper}>{helperText}</p>
      </div>
      <div className={styles.controls}>
        {filters.map((filter) => (
          <Dropdown
            key={filter.key}
            className={styles.filterDropdown}
            label={filter.placeholder || filter.key}
            placeholder={filter.placeholder || 'Seleccionar'}
            options={filter.options.map((option) => ({ key: option.value, text: option.label }))}
            value={currentValues[filter.key] || ''}
            darkMode={darkMode}
            onChange={(value) => {
              if (typeof value === 'string') {
                handleChange(filter.key, value);
              }
            }}
          />
        ))}
        <button type="button" className={styles.action} onClick={() => onApply?.(currentValues)} aria-label="Aplicar filtros" title="Aplicar filtros">{applyIcon}</button>
        <button type="button" className={styles.action} onClick={handleReset} aria-label="Limpiar filtros" title="Limpiar filtros">{resetIcon}</button>
      </div>
    </section>
  );
};

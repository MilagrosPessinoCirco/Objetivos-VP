import * as React from 'react';
import styles from './SearchBox.module.scss';
import type { ISearchBoxProps } from './SearchBox.types';

const searchIcon: string = require('./assets/search-20.svg');

export const SearchBox = React.forwardRef<HTMLInputElement, ISearchBoxProps>(({
  value,
  defaultValue,
  placeholder = 'Buscar',
  onValueChange,
  onSearch,
  className,
  onKeyDown,
  ...inputProps
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const currentValue = value === undefined ? internalValue : value;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const nextValue = event.target.value;
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    onKeyDown?.(event);
    if (event.key === 'Enter') {
      onSearch?.(currentValue);
    }
  };

  return (
    <div className={`${styles.searchBox} ${className || ''}`}>
      <img className={styles.icon} src={searchIcon} alt="" aria-hidden="true" />
      <input
        {...inputProps}
        ref={ref}
        className={styles.input}
        value={currentValue}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        type="search"
        aria-label={inputProps['aria-label'] || placeholder}
      />
    </div>
  );
});

SearchBox.displayName = 'SearchBox';

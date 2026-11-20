import * as React from 'react';
import { Avatar } from '../../components/Avatar';
import styles from './PeopleSuggestion.module.scss';
import type { IPeopleSuggestionProps } from './PeopleSuggestion.types';

export const PeopleSuggestion: React.FC<IPeopleSuggestionProps> = ({
  name,
  secondaryText,
  avatarSrc,
  avatarIcon,
  initials,
  selected = false,
  disabled = false,
  darkMode = false,
  className,
  onSelect,
}) => {
  const avatarType = avatarSrc ? 'photo' : avatarIcon ? 'icon' : 'name';

  return (
    <button
      type="button"
      className={`${styles.suggestion} ${selected ? styles.selected : ''} ${darkMode ? styles.dark : ''} ${className || ''}`}
      role="option"
      aria-selected={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      <Avatar type={avatarType} name={name} initials={initials} src={avatarSrc} icon={avatarIcon} size="md" />
      <span className={styles.text}>
        <span className={styles.name}>{name}</span>
        {secondaryText && <span className={styles.secondary}>{secondaryText}</span>}
      </span>
    </button>
  );
};

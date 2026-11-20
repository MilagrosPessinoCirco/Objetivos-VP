import * as React from 'react';
import { IconButton, Persona } from '@fluentui/react';
import { FigmaIcon } from '../../foundations/icons';
import styles from './PersonaTag.module.scss';
import type { IPersonaTagProps } from './PersonaTag.types';

export const PersonaTag: React.FC<IPersonaTagProps> = ({
  name,
  avatar,
  initials,
  removable = true,
  darkMode = false,
  className,
  onRemove,
}) => {
  return (
    <span className={`${styles.personaTag} ${darkMode ? styles.dark : ''} ${className || ''}`}>
      <Persona
        text={name}
        imageInitials={initials || name.slice(0, 2).toUpperCase()}
        coinSize={22}
        className={styles.persona}
        onRenderPersonaCoin={avatar ? () => <span className={styles.avatar}>{avatar}</span> : undefined}
      />
      {removable && (
        <IconButton
          className={styles.remove}
          ariaLabel={`Quitar ${name}`}
          onClick={onRemove}
          onRenderIcon={() => <FigmaIcon name="closeCircle" size="xs" />}
        />
      )}
    </span>
  );
};

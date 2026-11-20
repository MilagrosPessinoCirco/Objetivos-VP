import * as React from 'react';
import { PersonaCoin } from '@fluentui/react';
import styles from './Avatar.module.scss';
import type { IAvatarProps } from './Avatar.types';

function getInitials(name?: string, initials?: string): string {
  if (initials) {
    return initials.slice(0, 2).toUpperCase();
  }
  if (!name) {
    return '';
  }
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ? parts[0].charAt(0) : '';
  const second = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return `${first}${second}`.toUpperCase();
}

export const Avatar: React.FC<IAvatarProps> = ({
  type = 'name',
  name,
  initials,
  src,
  icon,
  size = 'md',
  alt = '',
  className,
}) => {
  const coinSize = size === 'sm' ? 22 : size === 'lg' ? 48 : 30;
  const resolvedType = type === 'photo' && !src ? 'name' : type;

  return (
    <PersonaCoin
      className={`${styles.avatar} ${styles[size]} ${className || ''}`}
      coinSize={coinSize}
      imageUrl={resolvedType === 'photo' ? src : undefined}
      imageAlt={alt}
      imageInitials={resolvedType === 'name' ? getInitials(name, initials) : undefined}
      onRenderInitials={resolvedType === 'icon' ? () => <span className={styles.icon}>{icon}</span> : undefined}
      aria-label={alt || name || undefined}
    />
  );
};

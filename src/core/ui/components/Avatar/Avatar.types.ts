import type { ReactNode } from 'react';

export type AvatarType = 'photo' | 'name' | 'icon';
export type AvatarSize = 'sm' | 'md' | 'lg';

export interface IAvatarProps {
  type?: AvatarType;
  name?: string;
  initials?: string;
  src?: string;
  icon?: ReactNode;
  size?: AvatarSize;
  alt?: string;
  className?: string;
}

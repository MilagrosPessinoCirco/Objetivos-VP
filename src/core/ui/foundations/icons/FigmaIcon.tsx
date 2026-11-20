import * as React from 'react';
import { Icon } from './Icon';
import { getFigmaIconSource } from './iconRegistry';
import type { FigmaIconName } from './iconRegistry';
import type { DesignSystemIconSize, IconVariant } from './sizes';

export interface IFigmaIconProps {
  name: FigmaIconName;
  size?: DesignSystemIconSize;
  variant?: IconVariant;
  alt?: string;
  className?: string;
}

export const FigmaIcon: React.FC<IFigmaIconProps> = ({
  name,
  size = 'md',
  variant = 'outline',
  alt = '',
  className,
}) => {
  const src = getFigmaIconSource(name, size, variant);

  return <Icon src={src} size={size} variant={variant} alt={alt} className={className} />;
};

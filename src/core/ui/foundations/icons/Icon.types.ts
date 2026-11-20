import type { DesignSystemIconSize, IconVariant } from './sizes';

export interface IIconProps {
  src: string;
  size?: DesignSystemIconSize;
  variant?: IconVariant;
  alt?: string;
  className?: string;
}

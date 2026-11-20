import * as React from 'react';
import { getBrandLogoSource } from './brandAssets';
import type { BrandLogoName } from './brandAssets';

export interface IBrandLogoProps {
  name: BrandLogoName;
  alt: string;
  height?: number;
  className?: string;
}

export const BrandLogo: React.FC<IBrandLogoProps> = ({ name, alt, height, className }) => (
  <img
    src={getBrandLogoSource(name)}
    alt={alt}
    className={className}
    style={height ? { height, width: 'auto' } : undefined}
  />
);

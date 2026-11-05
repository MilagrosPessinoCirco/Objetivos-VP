import type { ReactNode } from 'react';

export type RatingSize = 'large' | 'small';

export interface IRatingProps {
  label?: ReactNode;
  required?: boolean;
  rating?: number;
  defaultRating?: number;
  max?: number;
  size?: RatingSize;
  disabled?: boolean;
  readOnly?: boolean;
  darkMode?: boolean;
  ariaLabel?: string;
  ariaLabelFormat?: string;
  id?: string;
  className?: string;
  onChange?: (rating: number) => void;
}

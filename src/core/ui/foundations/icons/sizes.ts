export const iconSizes = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '28px',
  xxl: '32px',
  xxxl: '48px',
} as const;

export type DesignSystemIconSize = keyof typeof iconSizes;
export type IconVariant = 'outline' | 'filled';
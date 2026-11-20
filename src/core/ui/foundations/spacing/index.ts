export const spacing = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
} as const;

export type DesignSystemSpacing = typeof spacing;

// Base-2x spacing scale shown in the Figma "Espacios" foundation frame (node 443:18002).
export const spacingScale: string[] = ['96px', '80px', '64px', '48px', '32px', '24px', '16px', '8px', '4px'];

// Grid examples shown in the Figma "Grillas" foundation frame (node 443:18002).
export interface IGridScaleStep {
  width: string;
  columns: number;
  margin: string;
  gutter: string;
}

export const gridScale: IGridScaleStep[] = [
  { width: '1920px', columns: 12, margin: '120px', gutter: '16px' },
  { width: '1366px', columns: 12, margin: '32px', gutter: '16px' },
  { width: '640px', columns: 6, margin: '16px', gutter: '16px' },
];

export const elevation = {
  none: 'none',
  depth4: '0 1.6px 3.6px rgba(0, 0, 0, 0.25)',
  depth8: '0 3.2px 7.2px rgba(0, 0, 0, 0.25)',
  depth16: '0 6.4px 14.4px rgba(0, 0, 0, 0.25)',
  depth64: '0 25.6px 57.6px rgba(0, 0, 0, 0.25)',
  low: '0 1.6px 3.6px rgba(0, 0, 0, 0.25)',
  medium: '0 3.2px 7.2px rgba(0, 0, 0, 0.25)',
  high: '0 6.4px 14.4px rgba(0, 0, 0, 0.25)',
} as const;

export type DesignSystemElevation = typeof elevation;

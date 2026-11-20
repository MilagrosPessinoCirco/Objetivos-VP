export const colors = {
  brand: {
    primary: 'var(--ds-color-brand-primary)',
    primaryHover: 'var(--ds-color-brand-primary-hover)',
  },
  neutral: {
    white: 'var(--ds-color-neutral-white)',
    background: 'var(--ds-color-neutral-background)',
    border: 'var(--ds-color-neutral-border)',
    text: 'var(--ds-color-neutral-text)',
    textMuted: 'var(--ds-color-neutral-text-muted)',
  },
  semantic: {
    success: 'var(--ds-color-semantic-success)',
    warning: 'var(--ds-color-semantic-warning)',
    error: 'var(--ds-color-semantic-error)',
    info: 'var(--ds-color-semantic-info)',
  },
} as const;

export type DesignSystemColors = typeof colors;

export * from './colorScales';

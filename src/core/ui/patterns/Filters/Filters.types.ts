import type { ReactNode } from 'react';

export interface IFilterOption {
  value: string;
  label: string;
}

export interface IFilterDefinition {
  key: string;
  options: IFilterOption[];
  placeholder?: string;
}

export type FilterValues = Record<string, string>;

export interface IFiltersProps {
  title?: string;
  helperText?: string;
  filters: IFilterDefinition[];
  values?: FilterValues;
  defaultValues?: FilterValues;
  darkMode?: boolean;
  onChange?: (key: string, value: string, values: FilterValues) => void;
  onApply?: (values: FilterValues) => void;
  onReset?: () => void;
  applyIcon?: ReactNode;
  resetIcon?: ReactNode;
  className?: string;
}

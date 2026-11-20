import type { ReactNode } from 'react';

export type TableCellKind = 'text' | 'checkbox' | 'radio' | 'icon' | 'dropdown' | 'trailIcons' | 'chip' | 'link';
export type TableSelectionType = 'checkbox' | 'radio';

export interface ITableColumn<T> {
  key: string;
  header: ReactNode;
  kind?: TableCellKind;
  width?: string | number;
  render?: (value: unknown, row: T, rowIndex: number) => ReactNode;
}

export interface ITableGroup<T> {
  key: string;
  header: ReactNode;
  rows: T[];
  defaultCollapsed?: boolean;
}

export type TableRowHeight<T> = number | ((row: T, rowIndex: number) => number | undefined);

export interface ITableProps<T extends Record<string, unknown>> {
  columns: ITableColumn<T>[];
  rows: T[];
  groups?: ITableGroup<T>[];
  getRowKey?: (row: T, rowIndex: number) => string;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  selectable?: boolean;
  selectionType?: TableSelectionType;
  darkMode?: boolean;
  compact?: boolean;
  rowHeight?: TableRowHeight<T>;
  toolbar?: ReactNode;
  emptyText?: ReactNode;
  className?: string;
}

import * as React from 'react';
import {
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  Dropdown,
  Selection,
  SelectionMode,
} from '@fluentui/react';
import type { IColumn, IGroup } from '@fluentui/react';
import type { IObjectWithKey } from '@fluentui/react';
import styles from './Table.module.scss';
import type { ITableColumn, ITableGroup, ITableProps } from './Table.types';

function renderCell<T extends Record<string, unknown>>(
  column: ITableColumn<T>,
  row: T,
  rowIndex: number,
): React.ReactNode {
  const value = row[column.key];
  if (column.render) {
    return column.render(value, row, rowIndex);
  }

  if (column.kind === 'checkbox' || column.kind === 'radio') {
    return column.kind === 'checkbox'
      ? <input type="checkbox" className={styles.checkbox} checked={Boolean(value)} readOnly aria-label={String(column.header)} />
      : <input type="radio" className={styles.radio} checked={Boolean(value)} readOnly aria-label={String(column.header)} />;
  }

  if (column.kind === 'chip') {
    return <span className={styles.chip}>{String(value ?? '')}</span>;
  }

  if (column.kind === 'link') {
    return <a className={styles.link} href={String(value)}>{String(value)}</a>;
  }

  if (column.kind === 'dropdown') {
    return <Dropdown className={styles.dropdown} selectedKey={String(value ?? '')} options={[{ key: String(value ?? ''), text: String(value ?? '') }]} ariaLabel={String(column.header)} />;
  }

  return value as React.ReactNode;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  rows,
  groups,
  getRowKey = (_row, rowIndex) => String(rowIndex),
  selectedKeys,
  onSelectionChange,
  selectable = false,
  selectionType = 'checkbox',
  darkMode = false,
  compact = false,
  rowHeight,
  toolbar,
  emptyText = 'No hay datos para mostrar.',
  className,
}: ITableProps<T>): React.ReactElement {
  const displayedRows = groups ? groups.reduce((allRows, group) => allRows.concat(group.rows), [] as T[]) : rows;
  const listItems = displayedRows.map((row, rowIndex) => ({ ...row, key: getRowKey(row, rowIndex) })) as Array<T & IObjectWithKey>;
  const fluentGroups: IGroup[] | undefined = groups ? groups.reduce<IGroup[]>((result, group) => {
    const startIndex = result.reduce((index, currentGroup) => index + currentGroup.count, 0);
    result.push({
      key: group.key,
      name: String(group.header),
      startIndex,
      count: group.rows.length,
      level: 0,
      isCollapsed: group.defaultCollapsed,
    });
    return result;
  }, []) : undefined;
  const selectionRef = React.useRef<Selection<IObjectWithKey> | null>(null);
  const isSelectionUpdating = React.useRef(false);
  const appliedSelectedKeysRef = React.useRef<string | undefined>(undefined);
  // Checkbox (multi-select) state lives in React so it always re-renders on toggle; radio keeps reading Selection directly.
  const [checkedKeys, setCheckedKeys] = React.useState<string[]>(() => selectedKeys || []);

  if (!selectionRef.current) {
    selectionRef.current = new Selection<IObjectWithKey>({
      getKey: (row) => String(row.key),
      onSelectionChanged: () => {
        if (!isSelectionUpdating.current) {
          onSelectionChange?.(selectionRef.current!.getSelection().map((row) => String(row.key)));
        }
      },
    });
  }

  const itemsKeySignature = listItems.map((item) => String(item.key)).join('\u0000');

  React.useLayoutEffect(() => {
    // Refresh item references without clearing the current selection.
    selectionRef.current!.setItems(listItems, false);
  }, [itemsKeySignature]);

  const selectedKeysSignature = selectedKeys ? selectedKeys.slice().sort().join('\u0000') : undefined;

  React.useLayoutEffect(() => {
    // Only re-apply the controlled `selectedKeys` prop when it actually changes,
    // so local checkbox/radio toggles are not clobbered by unrelated re-renders.
    if (selectedKeysSignature === undefined || appliedSelectedKeysRef.current === selectedKeysSignature) {
      return;
    }
    appliedSelectedKeysRef.current = selectedKeysSignature;
    const selection = selectionRef.current!;
    isSelectionUpdating.current = true;
    selection.setAllSelected(false);
    (selectedKeys || []).forEach((key) => selection.setKeySelected(key, true, false));
    isSelectionUpdating.current = false;
    setCheckedKeys(selectedKeys || []);
  }, [selectedKeysSignature]);

  const fluentColumns: IColumn[] = columns.map((column) => ({
    key: column.key,
    name: String(column.header),
    fieldName: column.key,
    minWidth: typeof column.width === 'number' ? column.width : column.width ? parseInt(column.width, 10) || 72 : 88,
    maxWidth: typeof column.width === 'number' ? column.width : column.width ? parseInt(column.width, 10) || undefined : undefined,
    flexGrow: typeof column.width === 'number' || column.width ? 0 : 1,
    isResizable: true,
    onRender: (row, rowIndex) => <div className={styles.cellContent}>{renderCell(column, row as T, rowIndex || 0)}</div>,
  }));

  if (selectable && (selectionType === 'checkbox' || selectionType === 'radio')) {
    fluentColumns.unshift({
      key: '__selection__',
      name: '',
      minWidth: 48,
      maxWidth: 48,
      isResizable: false,
      onRenderHeader: selectionType === 'checkbox'
        ? () => {
          const allKeys = listItems.map((item) => String(item.key));
          const allChecked = allKeys.length > 0 && allKeys.every((key) => checkedKeys.indexOf(key) >= 0);
          const someChecked = !allChecked && allKeys.some((key) => checkedKeys.indexOf(key) >= 0);
          return (
            <input
              type="checkbox"
              className={`${styles.checkbox} ${styles.selectAll}`}
              checked={allChecked}
              ref={(node) => {
                if (node) {
                  node.indeterminate = someChecked;
                }
              }}
              onChange={() => {
                const nextChecked = !allChecked;
                selectionRef.current!.setAllSelected(nextChecked);
                setCheckedKeys(nextChecked ? allKeys : []);
              }}
              aria-label="Seleccionar todo"
            />
          );
        }
        : undefined,
      onRender: (row) => {
        const key = String((row as IObjectWithKey).key);

        if (selectionType === 'checkbox') {
          const isChecked = checkedKeys.indexOf(key) >= 0;
          return (
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={isChecked}
              onChange={() => {
                const nextChecked = !isChecked;
                selectionRef.current!.setKeySelected(key, nextChecked, false);
                setCheckedKeys((current) => (nextChecked ? [...current, key] : current.filter((existingKey) => existingKey !== key)));
              }}
              aria-label={`Seleccionar fila ${key}`}
            />
          );
        }

        const isSelected = selectionRef.current!.isKeySelected(key);
        return (
          <input
            type="radio"
            className={styles.radio}
            name={`${styles.table}-selection`}
            checked={isSelected}
            onChange={() => selectionRef.current!.setKeySelected(key, true, true)}
            aria-label={`Seleccionar fila ${key}`}
          />
        );
      },
    });
  }

  return (
    <div className={`${styles.tableWrapper} ${darkMode ? styles.dark : ''} ${className || ''}`}>
      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
      <DetailsList
        className={styles.table}
        items={listItems}
        columns={fluentColumns}
        groups={fluentGroups}
        selection={selectionRef.current}
        selectionMode={!selectable ? SelectionMode.none : selectionType === 'radio' ? SelectionMode.single : SelectionMode.multiple}
        checkboxVisibility={CheckboxVisibility.hidden}
        layoutMode={DetailsListLayoutMode.fixedColumns}
        listProps={groups ? { onShouldVirtualize: () => false } : undefined}
        compact={compact}
        onRenderRow={(props, defaultRender) => {
          if (!props || !defaultRender) {
            return null;
          }
          const height = typeof rowHeight === 'function' ? rowHeight(props.item as T, props.itemIndex) : rowHeight;
          return defaultRender({ ...props, className: `${props.className || ''} ${styles.bodyRow}`, styles: { root: { minHeight: height || 40 } } });
        }}
      />
      {displayedRows.length === 0 && <div className={styles.emptyCell}>{emptyText}</div>}
    </div>
  );
}

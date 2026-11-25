import * as React from 'react';

import { Button, Dropdown } from '../../../../../core/ui/components';
import { Panel } from '../../../../../core/ui/patterns';
import { spacing } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import styles from './FiltrosPanel.module.scss';

export interface IFiltroOption {
	key: string;
	text: string;
}

export interface IFiltroField<TFiltros> {
	key: keyof TFiltros;
	label: string;
	options: IFiltroOption[];
}

export interface IFiltrosPanelProps<TFiltros extends Record<keyof TFiltros, string>> {
	filtros: TFiltros;
	fields: (borrador: TFiltros) => Array<IFiltroField<TFiltros>>;
	normalize?: (borrador: TFiltros, changedKey: keyof TFiltros) => TFiltros;
	onApply: (filtros: TFiltros) => void;
	onClear: () => void;
	onClose: () => void;
}

const toKey = (value: string | string[]): string => (Array.isArray(value) ? value[0] : value);

function FiltrosPanel<TFiltros extends Record<keyof TFiltros, string>>({ filtros, fields, normalize, onApply, onClear, onClose }: IFiltrosPanelProps<TFiltros>): React.ReactElement {
	const [borrador, setBorrador] = React.useState<TFiltros>(filtros);

	const set = (key: keyof TFiltros) => (value: string | string[]): void => {
		const changed = { ...borrador, [key]: toKey(value) };
		setBorrador(normalize ? normalize(changed, key) : changed);
	};

	return (
		<Panel
			open
			className={styles.panel}
			title={strings.PalancasFilters}
			onClose={onClose}
			primaryAction={<Button variant="secondary" onClick={onClear}>{strings.IniciativasFiltersClear}</Button>}
			secondaryAction={<Button variant="primary" onClick={() => onApply(borrador)}>{strings.IniciativasFiltersApply}</Button>}
		>
			<div className={styles.fields} style={{ gap: spacing.lg }}>
				{fields(borrador).map((field) => (
					<Dropdown key={String(field.key)} label={field.label} options={field.options} value={borrador[field.key]} onChange={set(field.key)} />
				))}
			</div>
		</Panel>
	);
}

export default FiltrosPanel;

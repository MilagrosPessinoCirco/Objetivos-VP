import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button, Table, Tooltip } from '../../../../../../core/ui/components';
import type { ITableColumn } from '../../../../../../core/ui/components';
import { FigmaIcon, spacing, typography } from '../../../../../../core/ui/foundations';
import { Objetivo, Palanca } from '../../../../../../core/entities';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import ObjetivosTable from '../../../Objetivo/ObjetivosTable/ObjetivosTable';
import { getColorStep } from '../../../shared/getColorStep';
import { ICON_BUTTON_STYLE } from '../../../shared/iconButtonStyle';
import { formatPalancaId } from '../../formatPalancaId';
import styles from './PalancasTable.module.scss';

export interface IPalancasTableProps {
	palancas: Palanca[];
	emptyText: string;
	canManage: boolean;
	objetivosByPalanca?: Record<number, Objetivo[]>;
	onView: (id: number) => void;
	onViewObjetivo: (id: number) => void;
	onEdit?: (palanca: Palanca) => void;
}

type TableRow = {
	key: string;
	id: string;
	nombre: string;
	descripcion: string;
	objetivos: string;
	palanca: Palanca;
};

const EXPAND_COLUMN_WIDTH = 44;
const ID_COLUMN_WIDTH = 64;
const OBJECTIVES_COLUMN_WIDTH = 84;
const ACTIONS_COLUMN_WIDTH = 160;
const EXPAND_BUTTON_STYLE: CSSProperties = { ...ICON_BUTTON_STYLE, width: 20, minWidth: 20, padding: 0 };

const NESTED_STYLE: CSSProperties = {
	marginLeft: EXPAND_COLUMN_WIDTH,
	borderLeft: `3px solid ${getColorStep('Primary', '100').value}`,
	['--nested-header-bg' as string]: getColorStep('Primary', '50').value
};

const PalancasTable: React.FC<IPalancasTableProps> = ({ palancas, emptyText, canManage, objetivosByPalanca, onView, onViewObjetivo, onEdit }) => {
	const [expanded, setExpanded] = React.useState<number[]>([]);

	const toggle = (id: number): void =>
		setExpanded(expanded.indexOf(id) >= 0 ? expanded.filter((item) => item !== id) : expanded.concat([id]));

	const rowOf = (palanca: Palanca): TableRow => {
		const objetivos = objetivosByPalanca ? objetivosByPalanca[palanca.Id as number] ?? [] : undefined;
		return {
			key: `p-${palanca.Id}`,
			id: formatPalancaId(palanca.Id),
			nombre: palanca.Nombre ?? '',
			descripcion: palanca.Descripcion ?? '',
			objetivos: objetivos ? String(objetivos.length) : '',
			palanca
		};
	};

	const renderExpand = (row: TableRow): React.ReactNode => {
		if (!objetivosByPalanca) {
			return null;
		}
		const palancaId = row.palanca.Id as number;
		const isExpanded = expanded.indexOf(palancaId) >= 0;
		return (
			<Button
				iconOnly
				variant="secondary"
				size="small"
				style={EXPAND_BUTTON_STYLE}
				iconLeft={<FigmaIcon name="chevronRightPrimary" size="sm" className={isExpanded ? styles.chevronOpen : styles.chevron} />}
				aria-expanded={isExpanded}
				aria-label={Utils.replaceAll(isExpanded ? strings.PalancaCollapseAriaLabel : strings.PalancaExpandAriaLabel, '{0}', row.id)}
				onClick={() => toggle(palancaId)}
			/>
		);
	};

	const renderActions = (row: TableRow): React.ReactNode => {
		const palanca = row.palanca;
		return (
			<div className={styles.actions} style={{ gap: spacing.xs }}>
				{canManage && onEdit && (
					<Tooltip content={strings.PalancaEditTooltip}>
						<Button
							iconOnly
							variant="secondary"
							size="small"
							style={ICON_BUTTON_STYLE}
							iconLeft={<FigmaIcon name="editPrimary" />}
							aria-label={Utils.replaceAll(strings.PalancaEditAriaLabel, '{0}', row.id)}
							onClick={() => onEdit(palanca)}
						/>
					</Tooltip>
				)}
				<Tooltip content={strings.PalancaViewTooltip}>
					<Button
						iconOnly
						variant="secondary"
						size="small"
						style={ICON_BUTTON_STYLE}
						iconLeft={<FigmaIcon name="chevronCirclePrimary" />}
						aria-label={Utils.replaceAll(strings.PalancaViewAriaLabel, '{0}', row.id)}
						onClick={() => onView(palanca.Id as number)}
					/>
				</Tooltip>
			</div>
		);
	};

	const columns: ITableColumn<TableRow>[] = [
		{ key: 'expandir', header: '', width: EXPAND_COLUMN_WIDTH, render: (_value, row) => renderExpand(row) },
		{ key: 'id', header: strings.PalancaColumnId, width: ID_COLUMN_WIDTH },
		{ key: 'nombre', header: strings.PalancaColumnName, render: (value) => <span style={{ fontWeight: typography.weight.bold }}>{String(value)}</span> },
		{ key: 'descripcion', header: strings.PalancaColumnDescription, render: (value) => <span className={styles.description}>{String(value)}</span> },
		{ key: 'objetivos', header: strings.PalancaColumnObjectives, width: OBJECTIVES_COLUMN_WIDTH },
		{ key: 'acciones', header: strings.PalancaColumnActions, width: ACTIONS_COLUMN_WIDTH, render: (_value, row) => renderActions(row) }
	];

	if (palancas.length === 0) {
		return <Table<TableRow> columns={columns} rows={[]} getRowKey={(row) => row.key} emptyText={emptyText} />;
	}

	return (
		<div>
			{palancas.map((palanca, index) => {
				const row = rowOf(palanca);
				const objetivos = objetivosByPalanca && expanded.indexOf(palanca.Id as number) >= 0 ? objetivosByPalanca[palanca.Id as number] ?? [] : undefined;
				return (
					<div key={row.key} className={index === 0 ? undefined : styles.withoutHeader}>
						<Table<TableRow> columns={columns} rows={[row]} getRowKey={(item) => item.key} emptyText={emptyText} />
						{objetivos && (
							<div className={styles.nested} style={NESTED_STYLE}>
								<ObjetivosTable objetivos={objetivos} variant="palanca" emptyText={strings.PalancaObjectivesEmpty} onView={onViewObjetivo} />
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default PalancasTable;

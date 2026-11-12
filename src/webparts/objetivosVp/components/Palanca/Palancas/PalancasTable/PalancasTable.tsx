import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button, Table, Tooltip } from '../../../../../../core/ui/components';
import type { ITableColumn } from '../../../../../../core/ui/components';
import { Chip } from '../../../../../../core/ui/patterns';
import { FigmaIcon, spacing } from '../../../../../../core/ui/foundations';
import { Objetivo, Palanca } from '../../../../../../core/entities';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatObjetivoId, getEstadoChipColor } from '../../../Objetivo/objetivoUtils';
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
	kind: 'palanca' | 'objetivo' | 'vacio';
	id: string;
	nombre: string;
	descripcion: string;
	objetivos: string;
	palanca?: Palanca;
	objetivo?: Objetivo;
};

const EXPAND_COLUMN_WIDTH = 44;
const EXPAND_BUTTON_STYLE: CSSProperties = { ...ICON_BUTTON_STYLE, width: 20, minWidth: 20, padding: 0 };

const byId = (a: Objetivo, b: Objetivo): number => (a.Id ?? 0) - (b.Id ?? 0);

const PalancasTable: React.FC<IPalancasTableProps> = ({ palancas, emptyText, canManage, objetivosByPalanca, onView, onViewObjetivo, onEdit }) => {
	const [expanded, setExpanded] = React.useState<number[]>([]);

	const toggle = (id: number): void =>
		setExpanded(expanded.indexOf(id) >= 0 ? expanded.filter((item) => item !== id) : expanded.concat([id]));

	const rows: TableRow[] = palancas.reduce<TableRow[]>((result, palanca) => {
		const palancaId = palanca.Id as number;
		const objetivos = objetivosByPalanca ? (objetivosByPalanca[palancaId] ?? []).slice().sort(byId) : undefined;
		result.push({
			key: `p-${palancaId}`,
			kind: 'palanca',
			id: formatPalancaId(palanca.Id),
			nombre: palanca.Nombre ?? '',
			descripcion: palanca.Descripcion ?? '',
			objetivos: objetivos ? String(objetivos.length) : '',
			palanca
		});
		if (objetivos && expanded.indexOf(palancaId) >= 0) {
			if (objetivos.length === 0) {
				result.push({ key: `v-${palancaId}`, kind: 'vacio', id: '', nombre: strings.PalancaObjectivesEmpty, descripcion: '', objetivos: '' });
			}
			objetivos.forEach((objetivo) => result.push({
				key: `o-${objetivo.Id}`,
				kind: 'objetivo',
				id: formatObjetivoId(objetivo.Id),
				nombre: objetivo.Nombre ?? '',
				descripcion: [objetivo.Departamento?.Title, objetivo.Gerencia?.Title].filter((part) => part).join(' / '),
				objetivos: objetivo.Peso === undefined ? '' : `${objetivo.Peso}%`,
				objetivo
			}));
		}
		return result;
	}, []);

	const renderExpand = (row: TableRow): React.ReactNode => {
		if (row.kind !== 'palanca' || !objetivosByPalanca) {
			return null;
		}
		const palancaId = row.palanca?.Id as number;
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
		if (row.kind === 'objetivo' && row.objetivo) {
			const objetivo = row.objetivo;
			return (
				<div className={styles.actions} style={{ gap: spacing.xs }}>
					<Chip size="small" clickable={false} color={getEstadoChipColor(objetivo.Estado)} label={objetivo.Estado ?? ''} />
					<Tooltip content={strings.ObjetivoViewTooltip}>
						<Button
							iconOnly
							variant="secondary"
							size="small"
							style={ICON_BUTTON_STYLE}
							iconLeft={<FigmaIcon name="chevronCirclePrimary" />}
							aria-label={Utils.replaceAll(strings.ObjetivoViewAriaLabel, '{0}', row.id)}
							onClick={() => onViewObjetivo(objetivo.Id as number)}
						/>
					</Tooltip>
				</div>
			);
		}
		if (row.kind !== 'palanca' || !row.palanca) {
			return null;
		}
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
		{ key: 'id', header: strings.PalancaColumnId },
		{ key: 'nombre', header: strings.PalancaColumnName, render: (value, row) => (
			<span style={row.kind === 'objetivo' ? { paddingLeft: spacing.lg } : undefined}>{String(value)}</span>
		) },
		{ key: 'descripcion', header: strings.PalancaColumnDescription, render: (value) => <span className={styles.description}>{String(value)}</span> },
		{ key: 'objetivos', header: strings.PalancaColumnObjectives },
		{ key: 'acciones', header: strings.PalancaColumnActions, render: (_value, row) => renderActions(row) }
	];

	return <Table<TableRow> columns={columns} rows={rows} getRowKey={(row) => row.key} emptyText={emptyText} />;
};

export default PalancasTable;

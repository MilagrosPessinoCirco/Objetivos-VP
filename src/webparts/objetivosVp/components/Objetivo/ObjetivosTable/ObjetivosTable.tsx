import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button, Table, Tooltip } from '../../../../../core/ui/components';
import type { ITableColumn } from '../../../../../core/ui/components';
import { Chip } from '../../../../../core/ui/patterns';
import { FigmaIcon } from '../../../../../core/ui/foundations';
import { spacing, typography } from '../../../../../core/ui/foundations';
import { Objetivo } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../../shared/getColorStep';
import { ICON_BUTTON_STYLE } from '../../shared/iconButtonStyle';
import { DEFAULT_PROGRESS, formatObjetivoId, getEstadoChipColor } from '../objetivoUtils';
import styles from './ObjetivosTable.module.scss';

export interface IObjetivosTableProps {
	objetivos: Objetivo[];
	variant: 'palanca' | 'delVp' | 'otrasVp';
	emptyText: string;
	onView: (id: number) => void;
}

type ObjetivoRow = {
	id: string;
	nombre: string;
	vp: string;
	palanca: string;
	departamento: string;
	gerencia: string;
	peso: string;
	avance: string;
	estado: string;
	objetivo: Objetivo;
};

const ID_WIDTH = 70;
const LEVER_WIDTH = 150;
const DEPARTMENT_WIDTH = 130;
const MANAGEMENT_WIDTH = 110;
const WEIGHT_WIDTH = 60;
const STATUS_WIDTH = 104;
const PROGRESS_WIDTH = 90;
const ACTIONS_WIDTH = 48;
const PROGRESS_STYLE: CSSProperties = { fontWeight: typography.weight.bold, color: getColorStep('Red', '600').value };
const ACTION_BUTTON_STYLE: CSSProperties = { ...ICON_BUTTON_STYLE, width: 24, minWidth: 24, padding: 0 };

const byId = (a: Objetivo, b: Objetivo): number => (a.Id ?? 0) - (b.Id ?? 0);

const ObjetivosTable: React.FC<IObjetivosTableProps> = ({ objetivos, variant, emptyText, onView }) => {
	const rows: ObjetivoRow[] = objetivos.slice().sort(byId).map((objetivo) => ({
		id: formatObjetivoId(objetivo.Id),
		nombre: objetivo.Nombre ?? '',
		vp: objetivo.VP?.Title ?? '',
		palanca: objetivo.Palanca?.Title ?? '',
		departamento: objetivo.Departamento?.Title ?? '',
		gerencia: objetivo.Gerencia?.Title ?? '',
		peso: objetivo.Peso === undefined ? '' : `${objetivo.Peso}%`,
		avance: `${DEFAULT_PROGRESS}%`,
		estado: objetivo.Estado ?? '',
		objetivo
	}));

	const fixedWidths = variant !== 'otrasVp';

	const renderEstado = (row: ObjetivoRow): React.ReactNode => (
		<Chip size="small" clickable={false} color={getEstadoChipColor(row.objetivo.Estado)} label={row.estado} />
	);

	const renderActions = (row: ObjetivoRow): React.ReactNode => (
		<div className={styles.actions} style={{ gap: spacing.xs }}>
			<Tooltip content={strings.ObjetivoViewTooltip}>
				<Button
					iconOnly
					variant="secondary"
					size="small"
					style={fixedWidths ? ACTION_BUTTON_STYLE : ICON_BUTTON_STYLE}
					iconLeft={<FigmaIcon name="chevronCirclePrimary" />}
					aria-label={Utils.replaceAll(strings.ObjetivoViewAriaLabel, '{0}', row.id)}
					onClick={() => onView(row.objetivo.Id as number)}
				/>
			</Tooltip>
		</div>
	);


	const idColumn: ITableColumn<ObjetivoRow> = { key: 'id', header: strings.ObjetivoColumnId, width: fixedWidths ? ID_WIDTH : undefined };
	const nameColumn: ITableColumn<ObjetivoRow> = { key: 'nombre', header: strings.ObjetivoColumnName };
	const vpColumn: ITableColumn<ObjetivoRow> = { key: 'vp', header: strings.ObjetivoColumnVp };
	const leverColumn: ITableColumn<ObjetivoRow> = { key: 'palanca', header: strings.PalancaColumnName, width: LEVER_WIDTH };
	const departmentColumn: ITableColumn<ObjetivoRow> = { key: 'departamento', header: strings.ObjetivoColumnDepartment, width: fixedWidths ? DEPARTMENT_WIDTH : undefined };
	const managementColumn: ITableColumn<ObjetivoRow> = { key: 'gerencia', header: strings.ObjetivoColumnManagement, width: fixedWidths ? MANAGEMENT_WIDTH : undefined };
	const weightColumn: ITableColumn<ObjetivoRow> = { key: 'peso', header: strings.ObjetivoColumnWeight, width: fixedWidths ? WEIGHT_WIDTH : undefined };
	const progressColumn: ITableColumn<ObjetivoRow> = { key: 'avance', header: strings.ObjetivoColumnProgress, width: PROGRESS_WIDTH, render: (value) => <span style={PROGRESS_STYLE}>{String(value)}</span> };
	const statusColumn: ITableColumn<ObjetivoRow> = { key: 'estado', header: strings.ObjetivoColumnStatus, width: fixedWidths ? STATUS_WIDTH : undefined, render: (_value, row) => renderEstado(row) };
	const actionsColumn: ITableColumn<ObjetivoRow> = { key: 'acciones', header: fixedWidths ? strings.ObjetivoColumnView : strings.ObjetivoColumnActions, width: fixedWidths ? ACTIONS_WIDTH : undefined, render: (_value, row) => renderActions(row) };

	const columns: ITableColumn<ObjetivoRow>[] = variant === 'palanca'
		? [idColumn, nameColumn, departmentColumn, managementColumn, weightColumn, progressColumn, statusColumn, actionsColumn]
		: variant === 'delVp'
			? [idColumn, nameColumn, leverColumn, departmentColumn, managementColumn, weightColumn, progressColumn, statusColumn, actionsColumn]
			: [idColumn, nameColumn, vpColumn, departmentColumn, managementColumn, statusColumn, actionsColumn];

	return <Table<ObjetivoRow> columns={columns} rows={rows} getRowKey={(row) => row.id} emptyText={emptyText} />;
};

export default ObjetivosTable;

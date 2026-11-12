import * as React from 'react';

import { Button, Table, Tooltip } from '../../../../../core/ui/components';
import type { ITableColumn } from '../../../../../core/ui/components';
import { Chip } from '../../../../../core/ui/patterns';
import { FigmaIcon } from '../../../../../core/ui/foundations';
import { spacing } from '../../../../../core/ui/foundations';
import { Objetivo } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { ICON_BUTTON_STYLE } from '../../shared/iconButtonStyle';
import { formatObjetivoId, getEstadoChipColor } from '../objetivoUtils';
import styles from './ObjetivosTable.module.scss';

export interface IObjetivosTableProps {
	objetivos: Objetivo[];
	variant: 'palanca' | 'otrasVp';
	emptyText: string;
	onView: (id: number) => void;
}

type ObjetivoRow = {
	id: string;
	nombre: string;
	vp: string;
	departamento: string;
	gerencia: string;
	peso: string;
	estado: string;
	objetivo: Objetivo;
};

const byId = (a: Objetivo, b: Objetivo): number => (a.Id ?? 0) - (b.Id ?? 0);

const ObjetivosTable: React.FC<IObjetivosTableProps> = ({ objetivos, variant, emptyText, onView }) => {
	const rows: ObjetivoRow[] = objetivos.slice().sort(byId).map((objetivo) => ({
		id: formatObjetivoId(objetivo.Id),
		nombre: objetivo.Nombre ?? '',
		vp: objetivo.VP?.Title ?? '',
		departamento: objetivo.Departamento?.Title ?? '',
		gerencia: objetivo.Gerencia?.Title ?? '',
		peso: objetivo.Peso === undefined ? '' : `${objetivo.Peso}%`,
		estado: objetivo.Estado ?? '',
		objetivo
	}));

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
					style={ICON_BUTTON_STYLE}
					iconLeft={<FigmaIcon name="chevronCirclePrimary" />}
					aria-label={Utils.replaceAll(strings.ObjetivoViewAriaLabel, '{0}', row.id)}
					onClick={() => onView(row.objetivo.Id as number)}
				/>
			</Tooltip>
		</div>
	);

	const idColumn: ITableColumn<ObjetivoRow> = { key: 'id', header: strings.ObjetivoColumnId };
	const nameColumn: ITableColumn<ObjetivoRow> = { key: 'nombre', header: strings.ObjetivoColumnName };
	const vpColumn: ITableColumn<ObjetivoRow> = { key: 'vp', header: strings.ObjetivoColumnVp };
	const departmentColumn: ITableColumn<ObjetivoRow> = { key: 'departamento', header: strings.ObjetivoColumnDepartment };
	const managementColumn: ITableColumn<ObjetivoRow> = { key: 'gerencia', header: strings.ObjetivoColumnManagement };
	const weightColumn: ITableColumn<ObjetivoRow> = { key: 'peso', header: strings.ObjetivoColumnWeight };
	const statusColumn: ITableColumn<ObjetivoRow> = { key: 'estado', header: strings.ObjetivoColumnStatus, render: (_value, row) => renderEstado(row) };
	const actionsColumn: ITableColumn<ObjetivoRow> = { key: 'acciones', header: strings.ObjetivoColumnActions, render: (_value, row) => renderActions(row) };

	const columns: ITableColumn<ObjetivoRow>[] = variant === 'palanca'
		? [idColumn, nameColumn, departmentColumn, managementColumn, weightColumn, statusColumn, actionsColumn]
		: [idColumn, nameColumn, vpColumn, departmentColumn, managementColumn, statusColumn, actionsColumn];

	return <Table<ObjetivoRow> columns={columns} rows={rows} getRowKey={(row) => row.id} emptyText={emptyText} />;
};

export default ObjetivosTable;

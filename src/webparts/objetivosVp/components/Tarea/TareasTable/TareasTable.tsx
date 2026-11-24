import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button, Table, Tooltip } from '../../../../../core/ui/components';
import type { ITableColumn } from '../../../../../core/ui/components';
import { Chip } from '../../../../../core/ui/patterns';
import { FigmaIcon, spacing } from '../../../../../core/ui/foundations';
import { Iniciativa, Tarea } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import AvanceText from '../../shared/AvanceText/AvanceText';
import { ICON_BUTTON_STYLE } from '../../shared/iconButtonStyle';
import { formatDate } from '../../Objetivo/objetivoUtils';
import { formatIdNombre, formatIniciativaId } from '../../Iniciativa/iniciativaUtils';
import { formatTareaId, getEstadoTareaChipColor } from '../tareaUtils';
import styles from './TareasTable.module.scss';

export interface ITareasTableProps {
	tareas: Tarea[];
	variant: 'iniciativa' | 'bandeja';
	emptyText: string;
	iniciativas?: Iniciativa[];
	onView: (id: number) => void;
}

type TareaRow = {
	id: string;
	nombre: string;
	iniciativa: string;
	actualizada: string;
	responsable: string;
	compromiso: string;
	estado: string;
	tarea: Tarea;
};

const ID_WIDTH = 70;
const DATE_WIDTH = 110;
const PROGRESS_WIDTH = 90;
const STATUS_WIDTH = 104;
const ACTIONS_WIDTH = 48;
const ACTION_BUTTON_STYLE: CSSProperties = { ...ICON_BUTTON_STYLE, width: 24, minWidth: 24, padding: 0 };

const byId = (a: Tarea, b: Tarea): number => (a.Id ?? 0) - (b.Id ?? 0);

const getIniciativaText = (tarea: Tarea, iniciativas: Iniciativa[]): string => {
	const iniciativa = iniciativas.filter((item) => item.Id === tarea.Iniciativa?.Id)[0];
	return iniciativa ? formatIdNombre(formatIniciativaId(iniciativa.Id), iniciativa.Nombre) : tarea.Iniciativa?.Title ?? '';
};

const TareasTable: React.FC<ITareasTableProps> = ({ tareas, variant, emptyText, iniciativas = [], onView }) => {
	const rows: TareaRow[] = tareas.slice().sort(byId).map((tarea) => ({
		id: formatTareaId(tarea.Id),
		nombre: tarea.Nombre ?? '',
		iniciativa: getIniciativaText(tarea, iniciativas),
		actualizada: formatDate(tarea.FechaUltimaActualizacion),
		responsable: tarea.Responsable?.Title ?? '',
		compromiso: formatDate(tarea.FechaCompromiso),
		estado: tarea.Estado ?? '',
		tarea
	}));

	const renderAvance = (row: TareaRow): React.ReactNode => <AvanceText value={row.tarea.Avance ?? 0} />;

	const renderEstado = (row: TareaRow): React.ReactNode => (
		<Chip size="small" clickable={false} color={getEstadoTareaChipColor(row.tarea.Estado)} label={row.estado} />
	);

	const renderActions = (row: TareaRow): React.ReactNode => (
		<div className={styles.actions} style={{ gap: spacing.xs }}>
			<Tooltip content={strings.TareaViewTooltip}>
				<Button
					iconOnly
					variant="secondary"
					size="small"
					style={ACTION_BUTTON_STYLE}
					iconLeft={<FigmaIcon name="chevronCirclePrimary" />}
					aria-label={Utils.replaceAll(strings.TareaViewAriaLabel, '{0}', row.id)}
					onClick={() => onView(row.tarea.Id as number)}
				/>
			</Tooltip>
		</div>
	);

	const isBandeja = variant === 'bandeja';
	const columns: ITableColumn<TareaRow>[] = [
		{ key: 'id', header: strings.ObjetivoColumnId, width: ID_WIDTH },
		{ key: 'nombre', header: strings.TareaColumnName },
		...(isBandeja ? [{ key: 'iniciativa', header: strings.IniciativaColumnName }] : []),
		{ key: 'responsable', header: strings.TareaColumnResponsible },
		{ key: 'compromiso', header: strings.TareaColumnCommitment, width: DATE_WIDTH },
		...(isBandeja ? [{ key: 'actualizada', header: strings.TareaColumnUpdated, width: DATE_WIDTH }] : []),
		{ key: 'avance', header: strings.ObjetivoColumnProgress, width: PROGRESS_WIDTH, render: (_value, row) => renderAvance(row) },
		{ key: 'estado', header: strings.ObjetivoColumnStatus, width: STATUS_WIDTH, render: (_value, row) => renderEstado(row) },
		{ key: 'acciones', header: strings.ObjetivoColumnView, width: ACTIONS_WIDTH, render: (_value, row) => renderActions(row) }
	];

	return <Table<TareaRow> columns={columns} rows={rows} getRowKey={(row) => row.id} emptyText={emptyText} />;
};

export default TareasTable;

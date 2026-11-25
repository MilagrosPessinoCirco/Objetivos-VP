import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button, Table, Tooltip } from '../../../../../core/ui/components';
import type { ITableColumn } from '../../../../../core/ui/components';
import { Chip } from '../../../../../core/ui/patterns';
import { FigmaIcon, spacing } from '../../../../../core/ui/foundations';
import { IRiesgoConDecision } from '../../../../../core/api/Riesgo/IRiesgoService';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { ICON_BUTTON_STYLE } from '../../shared/iconButtonStyle';
import { formatDate } from '../../Objetivo/objetivoUtils';
import { formatIdNombre } from '../../Iniciativa/iniciativaUtils';
import { formatTareaId } from '../../Tarea/tareaUtils';
import { formatRiesgoId, getEstadoRiesgoChipColor, getEstadoRiesgoLabel } from '../riesgoUtils';
import styles from './RiesgosTable.module.scss';

export interface IRiesgosTableProps {
	variant: 'tarea' | 'iniciativa';
	items: IRiesgoConDecision[];
	emptyText: string;
	canEdit?: boolean;
	isEditable?: (item: IRiesgoConDecision) => boolean;
	onEdit?: (item: IRiesgoConDecision) => void;
	onView?: (tareaId: number) => void;
}

type RiesgoRow = {
	id: string;
	riesgo: string;
	requiereDecision: string;
	decision: string;
	fechaLimite: string;
	tarea: string;
	item: IRiesgoConDecision;
};

const ID_WIDTH = 70;
const REQUIRES_WIDTH = 130;
const DATE_WIDTH = 110;
const STATUS_WIDTH = 104;
const ACTIONS_WIDTH = 56;
const ACTION_BUTTON_STYLE: CSSProperties = { ...ICON_BUTTON_STYLE, width: 24, minWidth: 24, padding: 0 };

const RiesgosTable: React.FC<IRiesgosTableProps> = ({ variant, items, emptyText, canEdit, isEditable, onEdit, onView }) => {
	const rows: RiesgoRow[] = items.map((item) => ({
		id: formatRiesgoId(item.riesgo.Id),
		riesgo: item.riesgo.Descripcion ?? '',
		requiereDecision: item.riesgo.RequiereDecision ? strings.Yes : strings.No,
		decision: item.decision ? item.decision.DecisionNecesaria ?? strings.ObjetivoNoValue : strings.ObjetivoNoValue,
		fechaLimite: item.decision ? formatDate(item.decision.FechaLimite) || strings.ObjetivoNoValue : strings.ObjetivoNoValue,
		tarea: formatIdNombre(formatTareaId(item.riesgo.Tarea?.Id), item.riesgo.Tarea?.Title),
		item
	}));

	const renderEstado = (row: RiesgoRow): React.ReactNode => (
		<Chip size="small" clickable={false} color={getEstadoRiesgoChipColor(row.item.riesgo.Estado)} label={getEstadoRiesgoLabel(row.item.riesgo.Estado)} />
	);

	const renderEdit = (row: RiesgoRow): React.ReactNode => {
		if (!canEdit || !onEdit || !isEditable || !isEditable(row.item)) {
			return strings.ObjetivoNoValue;
		}
		return (
			<div className={styles.actions} style={{ gap: spacing.xs }}>
				<Tooltip content={strings.RiesgoEdit}>
					<Button
						iconOnly
						variant="secondary"
						size="small"
						style={ACTION_BUTTON_STYLE}
						iconLeft={<FigmaIcon name="editPrimary" />}
						aria-label={Utils.replaceAll(strings.RiesgoFormEditTitle, '{0}', row.id)}
						onClick={() => onEdit(row.item)}
					/>
				</Tooltip>
			</div>
		);
	};

	const renderView = (row: RiesgoRow): React.ReactNode => (
		<div className={styles.actions} style={{ gap: spacing.xs }}>
			<Tooltip content={strings.TareaViewTooltip}>
				<Button
					iconOnly
					variant="secondary"
					size="small"
					style={ACTION_BUTTON_STYLE}
					iconLeft={<FigmaIcon name="chevronCirclePrimary" />}
					aria-label={Utils.replaceAll(strings.TareaViewAriaLabel, '{0}', formatTareaId(row.item.riesgo.Tarea?.Id))}
					onClick={() => onView?.(row.item.riesgo.Tarea?.Id as number)}
				/>
			</Tooltip>
		</div>
	);

	const isTarea = variant === 'tarea';
	const columns: ITableColumn<RiesgoRow>[] = [
		{ key: 'id', header: strings.ObjetivoColumnId, width: ID_WIDTH },
		{ key: 'riesgo', header: strings.RiesgoColRisk },
		...(isTarea
			? [{ key: 'requiereDecision', header: strings.RiesgoFieldRequiresDecision, width: REQUIRES_WIDTH }]
			: [{ key: 'tarea', header: strings.TareaColumnName }]),
		{ key: 'decision', header: strings.RiesgoFieldDecision },
		{ key: 'fechaLimite', header: strings.RiesgoColDueDate, width: DATE_WIDTH },
		{ key: 'estado', header: strings.ObjetivoColumnStatus, width: STATUS_WIDTH, render: (_value, row) => renderEstado(row) },
		isTarea
			? { key: 'acciones', header: strings.ResultadoClaveColumnAction, width: ACTIONS_WIDTH, render: (_value, row) => renderEdit(row) }
			: { key: 'acciones', header: strings.ObjetivoColumnView, width: ACTIONS_WIDTH, render: (_value, row) => renderView(row) }
	];

	return <Table<RiesgoRow> columns={columns} rows={rows} getRowKey={(row) => row.id} emptyText={emptyText} />;
};

export default RiesgosTable;

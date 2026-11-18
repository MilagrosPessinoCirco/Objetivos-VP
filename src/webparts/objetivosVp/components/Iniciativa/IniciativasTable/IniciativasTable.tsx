import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button, Table, Tooltip } from '../../../../../core/ui/components';
import type { ITableColumn } from '../../../../../core/ui/components';
import { Chip } from '../../../../../core/ui/patterns';
import { FigmaIcon, spacing } from '../../../../../core/ui/foundations';
import { Iniciativa, Objetivo } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { ICON_BUTTON_STYLE } from '../../shared/iconButtonStyle';
import { isVpRrii } from '../../Objetivo/objetivoUtils';
import { formatAccountable, formatIniciativaId, formatObjetivoLabel, formatPeso, getEstadoIniciativaChipColor, getPesosIniciativa } from '../iniciativaUtils';
import styles from './IniciativasTable.module.scss';

export interface IIniciativasTableProps {
	iniciativas: Iniciativa[];
	variant: 'bandeja' | 'objetivo';
	objetivos?: Objetivo[];
	objetivo?: Objetivo;
	emptyText: string;
	onView: (id: number) => void;
}

type IniciativaRow = {
	id: string;
	nombre: string;
	objetivo: string;
	accountable: string;
	peso: string;
	estado: string;
	iniciativa: Iniciativa;
};

const ID_WIDTH = 70;
const WEIGHT_WIDTH = 70;
const STATUS_WIDTH = 104;
const ACTIONS_WIDTH = 48;
const ACTION_BUTTON_STYLE: CSSProperties = { ...ICON_BUTTON_STYLE, width: 24, minWidth: 24, padding: 0 };

const byId = (a: Iniciativa, b: Iniciativa): number => (a.Id ?? 0) - (b.Id ?? 0);

const IniciativasTable: React.FC<IIniciativasTableProps> = ({ iniciativas, variant, objetivos, objetivo, emptyText, onView }) => {
	const objetivoText = (iniciativa: Iniciativa): string => {
		const found = (objetivos ?? []).filter((item) => item.Id === iniciativa.Objetivo?.Id)[0];
		return found ? formatObjetivoLabel(found) : iniciativa.Objetivo?.Title ?? '';
	};

	const pesoText = (iniciativa: Iniciativa): string => {
		const enObjetivo = getPesosIniciativa(iniciativa, iniciativas, objetivo).enObjetivo;
		return enObjetivo === undefined ? '' : `${formatPeso(enObjetivo)}%`;
	};

	const rows: IniciativaRow[] = iniciativas.slice().sort(byId).map((iniciativa) => ({
		id: formatIniciativaId(iniciativa.Id),
		nombre: iniciativa.Nombre ?? '',
		objetivo: variant === 'bandeja' ? objetivoText(iniciativa) : '',
		accountable: formatAccountable(iniciativa),
		peso: variant === 'objetivo' ? pesoText(iniciativa) : '',
		estado: iniciativa.Estado ?? '',
		iniciativa
	}));

	const renderEstado = (row: IniciativaRow): React.ReactNode => (
		<Chip size="small" clickable={false} color={getEstadoIniciativaChipColor(row.iniciativa.Estado)} label={row.estado} />
	);

	const renderActions = (row: IniciativaRow): React.ReactNode => (
		<div className={styles.actions} style={{ gap: spacing.xs }}>
			<Tooltip content={strings.IniciativaViewTooltip}>
				<Button
					iconOnly
					variant="secondary"
					size="small"
					style={ACTION_BUTTON_STYLE}
					iconLeft={<FigmaIcon name="chevronCirclePrimary" />}
					aria-label={Utils.replaceAll(strings.IniciativaViewAriaLabel, '{0}', row.id)}
					onClick={() => onView(row.iniciativa.Id as number)}
				/>
			</Tooltip>
		</div>
	);

	const idColumn: ITableColumn<IniciativaRow> = { key: 'id', header: strings.ObjetivoColumnId, width: ID_WIDTH };
	const nameColumn: ITableColumn<IniciativaRow> = { key: 'nombre', header: strings.IniciativaColumnName };
	const objectiveColumn: ITableColumn<IniciativaRow> = { key: 'objetivo', header: strings.ObjetivoColumnName };
	const accountableColumn: ITableColumn<IniciativaRow> = { key: 'accountable', header: strings.IniciativaAccountable };
	const weightColumn: ITableColumn<IniciativaRow> = { key: 'peso', header: strings.ObjetivoColumnWeight, width: WEIGHT_WIDTH };
	const statusColumn: ITableColumn<IniciativaRow> = { key: 'estado', header: strings.ObjetivoColumnStatus, width: STATUS_WIDTH, render: (_value, row) => renderEstado(row) };
	const actionsColumn: ITableColumn<IniciativaRow> = { key: 'acciones', header: strings.ObjetivoColumnView, width: ACTIONS_WIDTH, render: (_value, row) => renderActions(row) };

	const showWeight = variant === 'objetivo' && isVpRrii(objetivo?.VP?.Title);
	const columns: ITableColumn<IniciativaRow>[] = variant === 'bandeja'
		? [idColumn, nameColumn, objectiveColumn, accountableColumn, statusColumn, actionsColumn]
		: showWeight
			? [idColumn, nameColumn, accountableColumn, weightColumn, statusColumn, actionsColumn]
			: [idColumn, nameColumn, accountableColumn, statusColumn, actionsColumn];

	return <Table<IniciativaRow> columns={columns} rows={rows} getRowKey={(row) => row.id} emptyText={emptyText} />;
};

export default IniciativasTable;

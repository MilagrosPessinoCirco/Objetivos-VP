import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button, Table, Tooltip } from '../../../../../../core/ui/components';
import type { ITableColumn } from '../../../../../../core/ui/components';
import { Chip } from '../../../../../../core/ui/patterns';
import { FigmaIcon, colors, typography } from '../../../../../../core/ui/foundations';
import { ResultadoClave } from '../../../../../../core/entities';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import SectionBand from '../../../shared/SectionBand/SectionBand';
import { ICON_BUTTON_STYLE } from '../../../shared/iconButtonStyle';
import {
	formatAvance,
	formatResultadoClaveId,
	formatResultadoClaveNumero,
	getCumplimiento,
	getEstadoResultadoClave,
	getEstadoResultadoClaveChip,
	getEstadoResultadoClaveLabel,
	getPesoResultadoClave,
	hasValorActual
} from '../../resultadoClaveUtils';

export interface IIniciativaResultadosClaveProps {
	resultados: ResultadoClave[];
	onTrack?: (resultado: ResultadoClave) => void;
}

type ResultadoClaveRow = {
	id: string;
	nombre: string;
	tipo: string;
	minimo: string;
	meta: string;
	maximo: string;
	peso: string;
	actual: string;
	proyectado: string;
	cumplimiento: string;
	estado: string;
	resultado: ResultadoClave;
};

const NUMBER_WIDTH = 72;
const STATUS_WIDTH = 104;
const ACTIONS_WIDTH = 64;
const SOURCE_SEPARATOR = ' · ';
const ACTION_BUTTON_STYLE: CSSProperties = { ...ICON_BUTTON_STYLE, width: 24, minWidth: 24, padding: 0 };
const SUBTEXT_STYLE: CSSProperties = {
	display: 'block',
	fontSize: typography.size[12],
	lineHeight: typography.lineHeight[12],
	color: colors.neutral.textMuted
};
const CURRENT_STYLE: CSSProperties = { fontWeight: typography.weight.bold };

const byId = (a: ResultadoClave, b: ResultadoClave): number => (a.Id ?? 0) - (b.Id ?? 0);

const IniciativaResultadosClave: React.FC<IIniciativaResultadosClaveProps> = ({ resultados, onTrack }) => {
	const peso = resultados.length === 0 ? '' : `${formatAvance(getPesoResultadoClave(resultados.length))}%`;

	const rows: ResultadoClaveRow[] = resultados.slice().sort(byId).map((resultado) => ({
		id: formatResultadoClaveId(resultado.Id),
		nombre: resultado.Nombre ?? '',
		tipo: resultado.TipoMedicion ?? '',
		minimo: formatResultadoClaveNumero(resultado.Minimo),
		meta: formatResultadoClaveNumero(resultado.Meta),
		maximo: formatResultadoClaveNumero(resultado.Maximo),
		peso,
		actual: formatResultadoClaveNumero(resultado.ValorActual),
		proyectado: formatResultadoClaveNumero(resultado.ValorProyectado),
		cumplimiento: hasValorActual(resultado) ? `${formatAvance(getCumplimiento(resultado))}%` : strings.ObjetivoNoValue,
		estado: getEstadoResultadoClaveLabel(getEstadoResultadoClave(resultado)),
		resultado
	}));

	const renderNombre = (row: ResultadoClaveRow): React.ReactNode => {
		const fuente = row.resultado.Fuente;
		const detalle = fuente
			? `${row.resultado.UnidadMedida ?? ''}${SOURCE_SEPARATOR}${Utils.replaceAll(strings.ResultadoClaveSource, '{0}', fuente)}`
			: row.resultado.UnidadMedida ?? '';
		return (
			<span>
				{row.nombre}
				<span style={SUBTEXT_STYLE}>{detalle}</span>
			</span>
		);
	};

	const renderEstado = (row: ResultadoClaveRow): React.ReactNode => {
		const chip = getEstadoResultadoClaveChip(getEstadoResultadoClave(row.resultado));
		return <Chip size="small" clickable={false} color={chip.color} style={chip.style} label={row.estado} />;
	};

	const renderAction = (row: ResultadoClaveRow): React.ReactNode =>
		onTrack ? (
			<Tooltip content={strings.ResultadoClaveTrackTooltip}>
				<Button
					iconOnly
					variant="secondary"
					size="small"
					style={ACTION_BUTTON_STYLE}
					iconLeft={<FigmaIcon name="editPrimary" />}
					aria-label={strings.ResultadoClaveTrackTooltip}
					onClick={() => onTrack(row.resultado)}
				/>
			</Tooltip>
		) : strings.ObjetivoNoValue;

	const columns: ITableColumn<ResultadoClaveRow>[] = [
		{ key: 'nombre', header: strings.ResultadoClaveColumnName, render: (_value, row) => renderNombre(row) },
		{ key: 'tipo', header: strings.ResultadoClaveColumnType },
		{ key: 'minimo', header: strings.ResultadoClaveColumnMin, width: NUMBER_WIDTH },
		{ key: 'meta', header: strings.ResultadoClaveColumnGoal, width: NUMBER_WIDTH },
		{ key: 'maximo', header: strings.ResultadoClaveColumnMax, width: NUMBER_WIDTH },
		{ key: 'peso', header: strings.ResultadoClaveColumnWeight, width: NUMBER_WIDTH },
		{ key: 'actual', header: strings.ResultadoClaveColumnCurrent, width: NUMBER_WIDTH, render: (_value, row) => <span style={CURRENT_STYLE}>{row.actual}</span> },
		{ key: 'proyectado', header: strings.ResultadoClaveColumnProjected, width: NUMBER_WIDTH },
		{ key: 'cumplimiento', header: strings.ResultadoClaveColumnCompliance, width: NUMBER_WIDTH },
		{ key: 'estado', header: strings.ResultadoClaveColumnStatus, width: STATUS_WIDTH, render: (_value, row) => renderEstado(row) },
		{ key: 'accion', header: strings.ResultadoClaveColumnAction, width: ACTIONS_WIDTH, render: (_value, row) => renderAction(row) }
	];

	return (
		<SectionBand title={Utils.replaceAll(strings.ResultadoClaveSection, '{0}', String(resultados.length))} collapsible>
			<Table<ResultadoClaveRow> columns={columns} rows={rows} getRowKey={(row) => row.id} emptyText={strings.ResultadoClaveEmpty} />
		</SectionBand>
	);
};

export default IniciativaResultadosClave;

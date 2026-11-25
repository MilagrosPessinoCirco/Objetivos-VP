import * as React from 'react';

import { spacing } from '../../../../../../core/ui/foundations';
import { Tarea } from '../../../../../../core/entities';
import { EstadoTarea } from '../../../../../../core/utils/Constants';
import * as strings from 'ObjetivosVpWebPartStrings';
import Field from '../../../shared/Field/Field';
import SectionBand from '../../../shared/SectionBand/SectionBand';
import styles from './IniciativaTareasIndicadores.module.scss';

export interface IIniciativaRiesgosIndicadores {
	activos: number;
	escalados: number;
	decisionesPendientes: number;
}

export interface IIniciativaTareasIndicadoresProps {
	tareas: Tarea[];
	riesgos?: IIniciativaRiesgosIndicadores;
}

const GRID_STYLE: React.CSSProperties = { columnGap: spacing.xxl, rowGap: spacing.md, padding: `0 ${spacing.xs}` };

const INDICADORES: Array<{ estado: EstadoTarea; label: string }> = [
	{ estado: EstadoTarea.NoIniciada, label: strings.TareasStateNotStarted },
	{ estado: EstadoTarea.EnCurso, label: strings.TareasStateInProgress },
	{ estado: EstadoTarea.Frenada, label: strings.TareasStateStopped },
	{ estado: EstadoTarea.Finalizada, label: strings.TareasStateFinished },
	{ estado: EstadoTarea.Cancelada, label: strings.TareasStateCancelled }
];

const INDICADORES_RIESGOS: Array<{ key: keyof IIniciativaRiesgosIndicadores; label: string }> = [
	{ key: 'activos', label: strings.RiesgoIndicatorActive },
	{ key: 'escalados', label: strings.RiesgoIndicatorEscalated },
	{ key: 'decisionesPendientes', label: strings.RiesgoIndicatorPendingDecisions }
];

const IniciativaTareasIndicadores: React.FC<IIniciativaTareasIndicadoresProps> = ({ tareas, riesgos }) => (
	<SectionBand title={strings.TareaIndicatorsSection} collapsible>
		<div className={styles.grid5} style={GRID_STYLE}>
			{INDICADORES.map((indicador) => (
				<Field
					key={indicador.estado}
					label={indicador.label}
					value={String(tareas.filter((tarea) => tarea.Estado === indicador.estado).length)}
				/>
			))}
			{riesgos && INDICADORES_RIESGOS.map((indicador) => (
				<Field key={indicador.key} label={indicador.label} value={String(riesgos[indicador.key])} />
			))}
		</div>
	</SectionBand>
);

export default IniciativaTareasIndicadores;

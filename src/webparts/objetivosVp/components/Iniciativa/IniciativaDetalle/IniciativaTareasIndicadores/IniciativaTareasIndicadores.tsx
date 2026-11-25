import * as React from 'react';

import { spacing } from '../../../../../../core/ui/foundations';
import { Tarea } from '../../../../../../core/entities';
import { EstadoTarea } from '../../../../../../core/utils/Constants';
import * as strings from 'ObjetivosVpWebPartStrings';
import Field from '../../../shared/Field/Field';
import SectionBand from '../../../shared/SectionBand/SectionBand';
import styles from './IniciativaTareasIndicadores.module.scss';

export interface IIniciativaTareasIndicadoresProps {
	tareas: Tarea[];
}

const GRID_STYLE: React.CSSProperties = { columnGap: spacing.xxl, rowGap: spacing.md, padding: `0 ${spacing.xs}` };

const INDICADORES: Array<{ estado: EstadoTarea; label: string }> = [
	{ estado: EstadoTarea.NoIniciada, label: strings.TareasStateNotStarted },
	{ estado: EstadoTarea.EnCurso, label: strings.TareasStateInProgress },
	{ estado: EstadoTarea.Frenada, label: strings.TareasStateStopped },
	{ estado: EstadoTarea.Finalizada, label: strings.TareasStateFinished },
	{ estado: EstadoTarea.Cancelada, label: strings.TareasStateCancelled }
];

const IniciativaTareasIndicadores: React.FC<IIniciativaTareasIndicadoresProps> = ({ tareas }) => (
	<SectionBand title={strings.TareaIndicatorsSection} collapsible>
		<div className={styles.grid5} style={GRID_STYLE}>
			{INDICADORES.map((indicador) => (
				<Field
					key={indicador.estado}
					label={indicador.label}
					value={String(tareas.filter((tarea) => tarea.Estado === indicador.estado).length)}
				/>
			))}
		</div>
	</SectionBand>
);

export default IniciativaTareasIndicadores;

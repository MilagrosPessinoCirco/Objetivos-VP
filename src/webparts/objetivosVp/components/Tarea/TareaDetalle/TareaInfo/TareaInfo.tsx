import * as React from 'react';

import { Button, Tooltip } from '../../../../../../core/ui/components';
import { FigmaIcon, spacing } from '../../../../../../core/ui/foundations';
import { Tarea } from '../../../../../../core/entities';
import { EstadoTarea } from '../../../../../../core/utils/Constants';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatDate } from '../../../Objetivo/objetivoUtils';
import { ICON_BUTTON_STYLE } from '../../../shared/iconButtonStyle';
import Field from '../../../shared/Field/Field';
import SectionBand from '../../../shared/SectionBand/SectionBand';
import styles from './TareaInfo.module.scss';

export interface ITareaInfoProps {
	tarea: Tarea;
	iniciativaText: string;
	objetivoText: string;
	areaNames: string;
	onEdit?: () => void;
}

const GRID_STYLE: React.CSSProperties = { columnGap: spacing.xxl, rowGap: spacing.md, padding: `0 ${spacing.xs}` };

const orNoValue = (value: string | undefined): string => (value === undefined || value === '' ? strings.ObjetivoNoValue : value);

const TareaInfo: React.FC<ITareaInfoProps> = ({ tarea, iniciativaText, objetivoText, areaNames, onEdit }) => {
	const fechaFinalizacion = tarea.Estado === EstadoTarea.Finalizada ? formatDate(tarea.FechaFinalizacion) : undefined;
	const editAction = onEdit && (
		<Tooltip content={strings.Edit}>
			<Button
				iconOnly
				variant="secondary"
				size="small"
				style={ICON_BUTTON_STYLE}
				iconLeft={<FigmaIcon name="editPrimary" />}
				aria-label={strings.Edit}
				onClick={onEdit}
			/>
		</Tooltip>
	);

	return (
		<SectionBand title={strings.TareaInfoSection} action={editAction} collapsible>
			<div className={styles.content} style={{ gap: spacing.lg }}>
				<div className={styles.grid4} style={GRID_STYLE}>
					<Field label={strings.IniciativaColumnName} value={orNoValue(iniciativaText)} />
					<Field label={strings.ObjetivoColumnName} value={orNoValue(objetivoText)} />
					<Field label={strings.TareaColumnResponsible} value={orNoValue(tarea.Responsable?.Title)} />
					<Field label={strings.IniciativaAreas} value={orNoValue(areaNames)} />
					<Field label={strings.TareaPriority} value={orNoValue(tarea.Prioridad ?? undefined)} />
					<Field label={strings.ObjetivoFieldStartDate} value={orNoValue(formatDate(tarea.FechaInicio))} />
					<Field label={strings.ObjetivoFieldCommitmentDate} value={orNoValue(formatDate(tarea.FechaCompromiso))} />
					<Field label={strings.TareaFinishDate} value={orNoValue(fechaFinalizacion)} />
				</div>
				<div style={{ padding: `0 ${spacing.xs}` }}>
					<Field label={strings.ObjetivoFieldDescription} value={orNoValue(tarea.Descripcion)} />
				</div>
				<div style={{ padding: `0 ${spacing.xs}` }}>
					<Field label={strings.TareaEnables} value={orNoValue(tarea.QueHabilita)} />
				</div>
			</div>
		</SectionBand>
	);
};

export default TareaInfo;

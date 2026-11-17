import * as React from 'react';

import { Button, Tooltip } from '../../../../../../core/ui/components';
import { FigmaIcon, spacing } from '../../../../../../core/ui/foundations';
import { Objetivo } from '../../../../../../core/entities';
import { Duracion } from '../../../../../../core/utils/Constants';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatDate, isVpRrii } from '../../objetivoUtils';
import { ICON_BUTTON_STYLE } from '../../../shared/iconButtonStyle';
import Field from '../../../shared/Field/Field';
import SectionBand from '../../../shared/SectionBand/SectionBand';
import styles from './ObjetivoInfo.module.scss';

export interface IObjetivoInfoProps {
	objetivo: Objetivo;
	onEdit?: () => void;
}

const GRID_STYLE: React.CSSProperties = { columnGap: spacing.xxl, rowGap: spacing.md, padding: `0 ${spacing.xs}` };

const ObjetivoInfo: React.FC<IObjetivoInfoProps> = ({ objetivo, onEdit }) => {
	const isRrii = isVpRrii(objetivo.VP?.Title);
	const pesoVpText = objetivo.PesoVP === undefined || objetivo.PesoVP === null ? strings.ObjetivoNoValue : `${objetivo.PesoVP} %`;
	const vpObjectiveText = objetivo.EsDeVp ? Utils.replaceAll(strings.ObjetivoVpObjectiveYes, '{0}', pesoVpText) : strings.No;
	const durationText = objetivo.Duracion === Duracion.Plurianual && objetivo.CantidadAnios !== undefined && objetivo.CantidadAnios !== null
		? Utils.replaceAll(Utils.replaceAll(strings.ObjetivoDurationYears, '{0}', objetivo.Duracion), '{1}', String(objetivo.CantidadAnios))
		: objetivo.Duracion ?? '';
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
		<>
			<SectionBand title={strings.ObjetivoInfoSection} action={editAction} collapsible>
				<div className={styles.content} style={{ gap: spacing.lg }}>
					<div className={styles.grid4} style={GRID_STYLE}>
						<Field label={strings.ObjetivoFieldVp} value={objetivo.VP?.Title ?? ''} />
						<Field label={strings.ObjetivoFieldDepartment} value={objetivo.Departamento?.Title ?? ''} />
						<Field label={strings.ObjetivoFieldManagement} value={objetivo.Gerencia?.Title ?? ''} />
						{isRrii && <Field label={strings.ObjetivoFieldVpObjective} value={vpObjectiveText} />}
					</div>
					{isRrii && (
						<div className={styles.grid4} style={GRID_STYLE}>
							<Field label={strings.ObjetivoFieldLever} value={objetivo.Palanca?.Title ?? ''} />
						</div>
					)}
					<div style={{ padding: `0 ${spacing.xs}` }}>
						<Field label={strings.ObjetivoFieldDescription} value={objetivo.Descripcion ?? ''} />
					</div>
				</div>
			</SectionBand>
			{isRrii && (
				<SectionBand title={strings.ObjetivoPlanningSection} action={editAction} collapsible>
					<div className={styles.grid4} style={GRID_STYLE}>
						<Field label={strings.ObjetivoFieldDuration} value={durationText} />
						<Field label={strings.ObjetivoFieldWeight} value={objetivo.Peso === undefined ? '' : `${objetivo.Peso} %`} />
						<Field label={strings.ObjetivoFieldStartDate} value={formatDate(objetivo.FechaInicio)} />
						<Field label={strings.ObjetivoFieldCommitmentDate} value={formatDate(objetivo.FechaCompromiso)} />
					</div>
				</SectionBand>
			)}
		</>
	);
};

export default ObjetivoInfo;

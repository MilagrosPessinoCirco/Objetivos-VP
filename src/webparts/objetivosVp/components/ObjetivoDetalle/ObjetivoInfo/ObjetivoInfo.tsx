import * as React from 'react';

import { Surface } from '../../../../../core/ui/patterns';
import { spacing } from '../../../../../core/ui/foundations';
import { Objetivo } from '../../../../../core/entities';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatDate, isVpRrii } from '../../objetivoUtils';
import { Field } from '../../PalancaDetalle/PalancaInfo/PalancaInfo';
import styles from './ObjetivoInfo.module.scss';

export interface IObjetivoInfoProps {
	objetivo: Objetivo;
}

const GRID_STYLE: React.CSSProperties = { columnGap: spacing.xxl, rowGap: spacing.md };

const ObjetivoInfo: React.FC<IObjetivoInfoProps> = ({ objetivo }) => {
	const isRrii = isVpRrii(objetivo.VP?.Title);

	return (
		<>
			<Surface variant="outline" padding="comfortable" header={strings.ObjetivoInfoSection}>
				<div className={styles.content} style={{ gap: spacing.lg }}>
					<div className={styles.grid} style={GRID_STYLE}>
						<Field label={strings.ObjetivoFieldName} value={objetivo.Nombre ?? ''} />
						<Field label={strings.ObjetivoFieldVp} value={objetivo.VP?.Title ?? ''} />
						<Field label={strings.ObjetivoFieldDepartment} value={objetivo.Departamento?.Title ?? ''} />
						<Field label={strings.ObjetivoFieldManagement} value={objetivo.Gerencia?.Title ?? ''} />
						{isRrii && <Field label={strings.ObjetivoFieldLever} value={objetivo.Palanca?.Title ?? ''} />}
						{isRrii && <Field label={strings.ObjetivoFieldVpObjective} value={objetivo.EsDeVp ? strings.Yes : strings.No} />}
					</div>
					<Field label={strings.ObjetivoFieldDescription} value={objetivo.Descripcion ?? ''} />
				</div>
			</Surface>
			{isRrii && (
				<Surface variant="outline" padding="comfortable" header={strings.ObjetivoPlanningSection}>
					<div className={styles.grid} style={GRID_STYLE}>
						<Field label={strings.ObjetivoFieldDuration} value={objetivo.Duracion ?? ''} />
						<Field label={strings.ObjetivoFieldWeight} value={objetivo.Peso === undefined ? '' : `${objetivo.Peso}%`} />
						<Field label={strings.ObjetivoFieldStartDate} value={formatDate(objetivo.FechaInicio)} />
						<Field label={strings.ObjetivoFieldCommitmentDate} value={formatDate(objetivo.FechaCompromiso)} />
					</div>
				</Surface>
			)}
		</>
	);
};

export default ObjetivoInfo;

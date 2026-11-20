import * as React from 'react';

import { Button, Tooltip } from '../../../../../../core/ui/components';
import { FigmaIcon, spacing } from '../../../../../../core/ui/foundations';
import { Iniciativa, Objetivo } from '../../../../../../core/entities';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatDate } from '../../../Objetivo/objetivoUtils';
import { ICON_BUTTON_STYLE } from '../../../shared/iconButtonStyle';
import Field from '../../../shared/Field/Field';
import SectionBand from '../../../shared/SectionBand/SectionBand';
import { IIniciativaPesos, formatAccountable, formatObjetivoLabel, formatPeso } from '../../iniciativaUtils';
import styles from './IniciativaInfo.module.scss';

export interface IIniciativaInfoProps {
	iniciativa: Iniciativa;
	objetivo?: Objetivo;
	areaNames: string;
	pesos: IIniciativaPesos;
	onEdit?: () => void;
}

const GRID_STYLE: React.CSSProperties = { columnGap: spacing.xxl, rowGap: spacing.md, padding: `0 ${spacing.xs}` };

const IniciativaInfo: React.FC<IIniciativaInfoProps> = ({ iniciativa, objetivo, areaNames, pesos, onEdit }) => {
	const objetivoText = objetivo
		? formatObjetivoLabel(objetivo)
		: iniciativa.Objetivo?.Title ?? '';
	const pesoDepartamentoText = pesos.enDepartamento === undefined || pesos.enDepartamento === null
		? strings.ObjetivoNoValue
		: `${formatPeso(pesos.enDepartamento)} %`;
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
		<SectionBand title={strings.IniciativaInfoSection} action={editAction} collapsible>
			<div className={styles.content} style={{ gap: spacing.lg }}>
				<div className={styles.grid4} style={GRID_STYLE}>
					<Field label={strings.ObjetivoColumnName} value={objetivoText} />
					<Field label={strings.IniciativaAccountable} value={formatAccountable(iniciativa)} />
					<Field label={strings.IniciativaAreas} value={areaNames} />
					<Field label={strings.ObjetivoFormStatus} value={iniciativa.Estado ?? ''} />
					<Field label={strings.ObjetivoFieldStartDate} value={formatDate(iniciativa.FechaInicio)} />
					<Field label={strings.ObjetivoFieldCommitmentDate} value={formatDate(iniciativa.FechaCompromiso)} />
					{pesos.enObjetivo !== undefined && (
						<>
							<Field label={strings.IniciativaFieldWeightObjective} value={`${formatPeso(pesos.enObjetivo)} %`} />
							<Field label={strings.ObjetivoFieldWeight} value={pesoDepartamentoText} />
						</>
					)}
				</div>
				<div style={{ padding: `0 ${spacing.xs}` }}>
					<Field label={strings.IniciativaDescription} value={iniciativa.Descripcion ?? ''} />
				</div>
			</div>
		</SectionBand>
	);
};

export default IniciativaInfo;

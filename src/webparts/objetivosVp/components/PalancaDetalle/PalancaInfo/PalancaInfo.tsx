import * as React from 'react';

import { Surface } from '../../../../../core/ui/patterns';
import { colors, spacing, typography } from '../../../../../core/ui/foundations';
import { Palanca } from '../../../../../core/entities';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatPalancaId } from '../../Palancas/formatPalancaId';
import styles from './PalancaInfo.module.scss';

export interface IPalancaInfoProps {
	palanca: Palanca;
}

const LABEL_STYLE: React.CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[12],
	lineHeight: typography.lineHeight[12],
	color: colors.neutral.textMuted
};

const VALUE_STYLE: React.CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[14],
	lineHeight: typography.lineHeight[14],
	fontWeight: typography.weight.semibold,
	color: colors.neutral.text
};

export interface IFieldProps {
	label: string;
	value: string;
}

export const Field: React.FC<IFieldProps> = ({ label, value }) => (
	<div className={styles.field} style={{ gap: spacing.xs }}>
		<span style={LABEL_STYLE}>{label}</span>
		<p className={styles.value} style={VALUE_STYLE}>{value}</p>
	</div>
);

const PalancaInfo: React.FC<IPalancaInfoProps> = ({ palanca }) => (
	<Surface variant="outline" padding="comfortable" header={strings.PalancaGeneralInfo}>
		<div className={styles.content} style={{ gap: spacing.lg }}>
			<div className={styles.grid3} style={{ columnGap: spacing.xxl, rowGap: spacing.md }}>
				<Field label={strings.PalancaFieldId} value={formatPalancaId(palanca.Id)} />
				<Field label={strings.PalancaFieldName} value={palanca.Nombre ?? ''} />
				<Field label={strings.PalancaFieldActive} value={palanca.Activa ? strings.Yes : strings.No} />
			</div>
			<Field label={strings.PalancaFieldDescription} value={palanca.Descripcion ?? ''} />
		</div>
	</Surface>
);

export default PalancaInfo;

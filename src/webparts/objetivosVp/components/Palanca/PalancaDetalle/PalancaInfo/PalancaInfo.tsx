import * as React from 'react';

import { Surface } from '../../../../../../core/ui/patterns';
import { spacing } from '../../../../../../core/ui/foundations';
import { Palanca } from '../../../../../../core/entities';
import * as strings from 'ObjetivosVpWebPartStrings';
import Field from '../../../shared/Field/Field';
import { formatPalancaId } from '../../formatPalancaId';
import styles from './PalancaInfo.module.scss';

export interface IPalancaInfoProps {
	palanca: Palanca;
}

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

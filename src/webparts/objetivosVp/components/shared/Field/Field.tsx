import * as React from 'react';

import { colors, spacing, typography } from '../../../../../core/ui/foundations';
import styles from './Field.module.scss';

export interface IFieldProps {
	label: string;
	value: string;
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

const Field: React.FC<IFieldProps> = ({ label, value }) => (
	<div className={styles.field} style={{ gap: spacing.xs }}>
		<span style={LABEL_STYLE}>{label}</span>
		<p className={styles.value} style={VALUE_STYLE}>{value}</p>
	</div>
);

export default Field;

import * as React from 'react';
import type { CSSProperties } from 'react';

import { Surface } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import { getColorStep } from '../getColorStep';
import styles from './SectionBand.module.scss';

export interface ISectionBandProps {
	title: string;
	action?: React.ReactNode;
	children: React.ReactNode;
}

const SURFACE_STYLE: CSSProperties = { border: 'none', background: 'transparent' };

const TITLE_STYLE: CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[14],
	lineHeight: typography.lineHeight[14],
	fontWeight: typography.weight.semibold,
	color: getColorStep('Primary', '800').value
};

const BAND_STYLE: CSSProperties = {
	backgroundColor: getColorStep('Primary', '50').value,
	padding: `0 ${spacing.md}`
};

const SectionBand: React.FC<ISectionBandProps> = ({ title, action, children }) => (
	<Surface
		variant="default"
		padding="none"
		borderRadius={0}
		style={SURFACE_STYLE}
		header={
			<div className={styles.band} style={BAND_STYLE}>
				<span style={TITLE_STYLE}>{title}</span>
				{action}
			</div>
		}
	>
		<div style={{ paddingTop: spacing.md }}>{children}</div>
	</Surface>
);

export default SectionBand;

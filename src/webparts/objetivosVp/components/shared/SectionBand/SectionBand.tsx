import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button, Tooltip } from '../../../../../core/ui/components';
import { Surface } from '../../../../../core/ui/patterns';
import { FigmaIcon, spacing, typography } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../getColorStep';
import { ICON_BUTTON_STYLE } from '../iconButtonStyle';
import styles from './SectionBand.module.scss';

export interface ISectionBandProps {
	title: string;
	action?: React.ReactNode;
	collapsible?: boolean;
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

const TOGGLE_BUTTON_STYLE: CSSProperties = { ...ICON_BUTTON_STYLE, width: 24, minWidth: 24, padding: 0 };

const BAND_STYLE: CSSProperties = {
	backgroundColor: getColorStep('Primary', '50').value,
	padding: `0 ${spacing.md}`
};

const SectionBand: React.FC<ISectionBandProps> = ({ title, action, collapsible, children }) => {
	const [isOpen, setIsOpen] = React.useState<boolean>(true);
	const toggleLabel = isOpen ? strings.SectionCollapse : strings.SectionExpand;

	return (
		<Surface
			variant="default"
			padding="none"
			borderRadius={0}
			style={SURFACE_STYLE}
			header={
				<div className={styles.band} style={BAND_STYLE}>
					<span style={TITLE_STYLE}>{title}</span>
					<span className={styles.controls} style={{ gap: spacing.xs }}>
						{action}
						{collapsible && (
							<Tooltip content={toggleLabel}>
								<Button
									iconOnly
									variant="secondary"
									size="small"
									style={TOGGLE_BUTTON_STYLE}
									iconLeft={<FigmaIcon name="chevronRightPrimary" size="sm" className={isOpen ? styles.chevronOpen : styles.chevronClosed} />}
									aria-expanded={isOpen}
									aria-label={toggleLabel}
									onClick={() => setIsOpen(!isOpen)}
								/>
							</Tooltip>
						)}
					</span>
				</div>
			}
		>
			{isOpen && <div style={{ paddingTop: spacing.md }}>{children}</div>}
		</Surface>
	);
};

export default SectionBand;

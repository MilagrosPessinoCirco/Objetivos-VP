import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button } from '../../../../../../core/ui/components';
import { SearchBox } from '../../../../../../core/ui/patterns';
import { FigmaIcon, spacing, typography } from '../../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import BackButton from '../../../shared/BackButton/BackButton';
import RefreshButton from '../../../shared/RefreshButton/RefreshButton';
import { getColorStep } from '../../../shared/getColorStep';
import { HEADER_TITLE_STYLE } from '../../../shared/pageTitleStyle';
import styles from './IniciativasHeader.module.scss';

export interface IIniciativasHeaderProps {
	title: string;
	searchText: string;
	onSearchChange: (value: string) => void;
	onBack: () => void;
	onRefresh: () => void;
	onOpenFilters: () => void;
	canCreate: boolean;
	onNew?: () => void;
	searchPlaceholder?: string;
	newLabel?: string;
}

const BOLD_STYLE: CSSProperties = { fontWeight: typography.weight.bold };

const buttonStyle = (group: string, scale: string): CSSProperties => {
	const color = getColorStep(group, scale).value;
	return { ...BOLD_STYLE, backgroundColor: color, borderColor: color };
};

const FILTER_STYLE: CSSProperties = { ...buttonStyle('Primary', '300'), color: getColorStep('Primary', '300').textColor };
const NEW_INICIATIVA_STYLE = buttonStyle('Tertiary', '900');

const IniciativasHeader: React.FC<IIniciativasHeaderProps> = ({ title, searchText, onSearchChange, onBack, onRefresh, onOpenFilters, canCreate, onNew }) => (
	<div className={styles.header} style={{ gap: spacing.md }}>
		<div className={styles.left} style={{ gap: spacing.md }}>
			<BackButton onClick={onBack} />
			<h1 style={HEADER_TITLE_STYLE}>{title}</h1>
		</div>
		<div className={styles.tools} style={{ gap: spacing.md }}>
			<SearchBox className={styles.search} placeholder={strings.IniciativasSearchPlaceholder} value={searchText} onValueChange={onSearchChange} />
			<RefreshButton onClick={onRefresh} />
			<Button variant="primary" className={styles.control} style={FILTER_STYLE} iconLeft={<FigmaIcon name="list" />} onClick={onOpenFilters}>
				{strings.PalancasFilters}
			</Button>
			{canCreate && onNew && (
				<Button variant="primary" className={styles.control} style={NEW_INICIATIVA_STYLE} iconLeft={<FigmaIcon name="add" className={styles.whiteIcon} />} onClick={onNew}>
					{newLabel}
				</Button>
			)}
		</div>
	</div>
);

export default IniciativasHeader;

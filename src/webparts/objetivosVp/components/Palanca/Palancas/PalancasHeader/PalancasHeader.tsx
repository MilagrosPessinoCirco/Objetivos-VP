import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button, Tooltip } from '../../../../../../core/ui/components';
import { SearchBox } from '../../../../../../core/ui/patterns';
import { FigmaIcon, spacing, typography } from '../../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import BackButton from '../../../shared/BackButton/BackButton';
import { getColorStep } from '../../../shared/getColorStep';
import { HEADER_TITLE_STYLE } from '../../../shared/pageTitleStyle';
import styles from './PalancasHeader.module.scss';

export interface IPalancasHeaderProps {
	searchText: string;
	onSearchChange: (value: string) => void;
	onBack: () => void;
	onRefresh: () => void;
	canManage: boolean;
	onNew?: () => void;
	canCreateObjetivo: boolean;
	onNewObjetivo?: () => void;
}

const BOLD_STYLE: CSSProperties = { fontWeight: typography.weight.bold };

const buttonStyle = (group: string, scale: string): CSSProperties => {
	const color = getColorStep(group, scale).value;
	return { ...BOLD_STYLE, backgroundColor: color, borderColor: color };
};

const FILTER_STYLE: CSSProperties = { ...buttonStyle('Primary', '300'), color: getColorStep('Primary', '300').textColor };
const REFRESH_STYLE = buttonStyle('Primary', '100');
const NEW_PALANCA_STYLE = buttonStyle('Secondary', '700');
const NEW_OBJETIVO_STYLE = buttonStyle('Tertiary', '900');

const PalancasHeader: React.FC<IPalancasHeaderProps> = ({ searchText, onSearchChange, onBack, onRefresh, canManage, onNew, canCreateObjetivo, onNewObjetivo }) => {
	return (
		<div className={styles.header} style={{ gap: spacing.md }}>
			<div className={styles.left} style={{ gap: spacing.md }}>
				<BackButton onClick={onBack} />
				<h1 style={HEADER_TITLE_STYLE}>{strings.PalancasTitle}</h1>
			</div>
			<div className={styles.tools} style={{ gap: spacing.md }}>
				<SearchBox className={styles.search} placeholder={strings.PalancasSearchPlaceholder} value={searchText} onValueChange={onSearchChange} />
				<Tooltip content={strings.PalancasRefresh}>
					<Button
						iconOnly
						className={styles.control}
						variant="primary"
						style={REFRESH_STYLE}
						iconLeft={<FigmaIcon name="reload" />}
						aria-label={strings.PalancasRefresh}
						onClick={onRefresh}
					/>
				</Tooltip>
				<Button variant="primary" className={styles.control} style={FILTER_STYLE} iconLeft={<FigmaIcon name="list" />}>
					{strings.PalancasFilters}
				</Button>
				{canManage && onNew && (
					<Button variant="primary" className={styles.control} style={NEW_PALANCA_STYLE} iconLeft={<FigmaIcon name="add" className={styles.whiteIcon} />} onClick={onNew}>
						{strings.PalancaNew}
					</Button>
				)}
				{canCreateObjetivo && onNewObjetivo && (
					<Button variant="primary" className={styles.control} style={NEW_OBJETIVO_STYLE} iconLeft={<FigmaIcon name="add" className={styles.whiteIcon} />} onClick={onNewObjetivo}>
						{strings.ObjetivoNew}
					</Button>
				)}
			</div>
		</div>
	);
};

export default PalancasHeader;

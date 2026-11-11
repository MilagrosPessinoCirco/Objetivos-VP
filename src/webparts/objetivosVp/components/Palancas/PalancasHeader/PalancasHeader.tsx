import * as React from 'react';

import { Button, Tooltip } from '../../../../../core/ui/components';
import { SearchBox } from '../../../../../core/ui/patterns';
import { FigmaIcon, spacing } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import { PAGE_TITLE_STYLE } from '../pageTitleStyle';
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

const PalancasHeader: React.FC<IPalancasHeaderProps> = ({ searchText, onSearchChange, onBack, onRefresh, canManage, onNew, canCreateObjetivo, onNewObjetivo }) => {
	return (
		<div className={styles.header} style={{ gap: spacing.md }}>
			<div className={styles.left} style={{ gap: spacing.md }}>
				<Button variant="secondary" size="small" iconLeft={<FigmaIcon name="arrowCircle" />} onClick={onBack}>
					{strings.Back}
				</Button>
				<h1 style={PAGE_TITLE_STYLE}>{strings.PalancasTitle}</h1>
			</div>
			<div className={styles.tools} style={{ gap: spacing.md }}>
				<SearchBox placeholder={strings.PalancasSearchPlaceholder} value={searchText} onValueChange={onSearchChange} />
				<Tooltip content={strings.PalancasRefresh}>
					<Button
						iconOnly
						variant="secondary"
						iconLeft={<FigmaIcon name="reloadPrimary" />}
						aria-label={strings.PalancasRefresh}
						onClick={onRefresh}
					/>
				</Tooltip>
				{canManage && onNew && (
					<Button variant="primary" iconLeft={<FigmaIcon name="add" />} onClick={onNew}>
						{strings.PalancaNew}
					</Button>
				)}
				{canCreateObjetivo && onNewObjetivo && (
					<Button variant="primary" iconLeft={<FigmaIcon name="add" />} onClick={onNewObjetivo}>
						{strings.ObjetivoNew}
					</Button>
				)}
			</div>
		</div>
	);
};

export default PalancasHeader;

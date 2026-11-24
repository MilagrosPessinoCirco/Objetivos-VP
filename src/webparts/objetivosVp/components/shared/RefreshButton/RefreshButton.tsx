import * as React from 'react';
import type { CSSProperties } from 'react';

import { Button, Tooltip } from '../../../../../core/ui/components';
import { FigmaIcon, typography } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../getColorStep';
import styles from './RefreshButton.module.scss';

export interface IRefreshButtonProps {
	onClick: () => void;
}

const REFRESH_COLOR = getColorStep('Primary', '100').value;
const REFRESH_STYLE: CSSProperties = { fontWeight: typography.weight.bold, backgroundColor: REFRESH_COLOR, borderColor: REFRESH_COLOR };

const RefreshButton: React.FC<IRefreshButtonProps> = ({ onClick }) => (
	<Tooltip content={strings.PalancasRefresh}>
		<Button
			iconOnly
			className={styles.control}
			variant="primary"
			style={REFRESH_STYLE}
			iconLeft={<FigmaIcon name="reload" />}
			aria-label={strings.PalancasRefresh}
			onClick={onClick}
		/>
	</Tooltip>
);

export default RefreshButton;

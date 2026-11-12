import * as React from 'react';

import { FigmaIcon } from '../../../../../core/ui/foundations';
import type { FigmaIconName } from '../../../../../core/ui/foundations';
import { HomeCard } from '../../../../../core/ui/patterns';
import styles from './AccessButton.module.scss';

export interface IAccessButtonProps {
	title: string;
	iconName: FigmaIconName;
	backgroundColor: string;
	textColor: string;
	onClick?: () => void;
}

const AccessButton: React.FC<IAccessButtonProps> = ({ title, iconName, backgroundColor, textColor, onClick }) => (
	<HomeCard
		type="simple"
		title={title}
		icon={<FigmaIcon name={iconName} size="xxl" className={styles.icon} />}
		backgroundColor={backgroundColor}
		textColor={textColor}
		onAction={onClick}
		className={styles.card}
	/>
);

export default AccessButton;

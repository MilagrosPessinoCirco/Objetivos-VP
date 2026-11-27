import * as React from 'react';

import { HomeCard } from '../../../../../core/ui/patterns';
import styles from './AccessButton.module.scss';

export interface IAccessButtonProps {
	title: string;
	icon: string;
	backgroundColor: string;
	textColor: string;
	onClick?: () => void;
}

const AccessButton: React.FC<IAccessButtonProps> = ({ title, icon, backgroundColor, textColor, onClick }) => (
	<HomeCard
		type="simple"
		title={title}
		icon={<img src={icon} alt="" />}
		backgroundColor={backgroundColor}
		textColor={textColor}
		onAction={onClick}
		className={styles.card}
	/>
);

export default AccessButton;

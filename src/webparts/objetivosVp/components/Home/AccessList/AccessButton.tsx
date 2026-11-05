import * as React from 'react';
import { DefaultButton, IButtonStyles } from '@fluentui/react';

import { FigmaIcon, spacing, typography } from '../../../../../core/ui/foundations';
import type { FigmaIconName } from '../../../../../core/ui/foundations';
import styles from './AccessButton.module.scss';

export interface IAccessButtonProps {
	title: string;
	iconName: FigmaIconName;
	backgroundColor: string;
	textColor: string;
}

const AccessButton: React.FC<IAccessButtonProps> = ({ title, iconName, backgroundColor, textColor }) => {
	const fixedState = {
		backgroundColor,
		color: textColor
	};

	const buttonStyles: IButtonStyles = {
		root: {
			...fixedState,
			border: 'none',
			borderRadius: spacing.lg,
			width: '100%',
			height: 'auto',
			padding: `${spacing.xl} ${spacing.xl}`
		},
		rootHovered: fixedState,
		rootPressed: fixedState,
		rootFocused: fixedState,
		flexContainer: {
			justifyContent: 'space-between',
			width: '100%'
		},
		label: {
			margin: 0,
			fontFamily: typography.family.base,
			fontSize: typography.size[32],
			lineHeight: typography.lineHeight[32],
			fontWeight: typography.weight.bold
		}
	};

	return (
		<DefaultButton className={styles.button} styles={buttonStyles}>
			<span>{title}</span>
			<FigmaIcon name={iconName} size="xxl" className={styles.icon} />
		</DefaultButton>
	);
};

export default AccessButton;

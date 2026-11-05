import * as React from 'react';

import { colorScales, spacing } from '../../../../../core/ui/foundations';
import type { FigmaIconName, IColorScaleStep } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import AccessButton from './AccessButton';
import styles from './AccessList.module.scss';

interface IAccessItem {
	title: string;
	iconName: FigmaIconName;
	colorGroup: string;
	colorScale: string;
}

const ACCESS_ITEMS: IAccessItem[] = [
	{ title: strings.AccessMyTasks, iconName: 'checkmark', colorGroup: 'Primary', colorScale: '800' },
	{ title: strings.AccessMyInitiatives, iconName: 'applications', colorGroup: 'Tertiary', colorScale: '800' },
	{ title: strings.AccessLeversObjectives, iconName: 'flag', colorGroup: 'Tertiary', colorScale: '500' },
	{ title: strings.AccessVpDashboard, iconName: 'list', colorGroup: 'Primary', colorScale: '600' },
	{ title: strings.AccessAbm, iconName: 'users', colorGroup: 'Secondary', colorScale: '700' }
];

const getColorStep = (group: string, scale: string): IColorScaleStep => {
	const step = colorScales
		.filter((colorGroup) => colorGroup.name === group)
		.reduce<IColorScaleStep[]>((steps, colorGroup) => steps.concat(colorGroup.steps), [])
		.filter((colorStep) => colorStep.scale === scale)[0];

	if (!step) {
		throw new Error(`No se encontró el paso de color "${scale}" del grupo "${group}" en colorScales.`);
	}

	return step;
};

const AccessList: React.FC = () => {
	return (
		<div className={styles.list} style={{ rowGap: spacing.lg }}>
			{ACCESS_ITEMS.map((item) => {
				const step = getColorStep(item.colorGroup, item.colorScale);

				return (
					<AccessButton
						key={item.title}
						title={item.title}
						iconName={item.iconName}
						backgroundColor={step.value}
						textColor={step.textColor}
					/>
				);
			})}
		</div>
	);
};

export default AccessList;

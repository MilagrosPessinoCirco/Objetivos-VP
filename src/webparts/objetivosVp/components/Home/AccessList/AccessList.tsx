import * as React from 'react';
import { useNavigate } from 'react-router-dom';

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
	route: string;
}

const ACCESS_ITEMS: IAccessItem[] = [
	{ title: strings.AccessMyTasks, iconName: 'checkmark', colorGroup: 'Primary', colorScale: '800', route: '/tarea' },
	{ title: strings.AccessMyInitiatives, iconName: 'applications', colorGroup: 'Tertiary', colorScale: '800', route: '/iniciativa' },
	{ title: strings.AccessObjectives, iconName: 'list', colorGroup: 'Primary', colorScale: '600', route: '/objetivo' },
	{ title: strings.AccessLevers, iconName: 'flag', colorGroup: 'Tertiary', colorScale: '500', route: '/palanca' }
	// Pendientes de implementar:
	// { title: strings.AccessVpDashboard, iconName: 'list', colorGroup: 'Primary', colorScale: '600', route: '/tablero' },
	// { title: strings.AccessAbm, iconName: 'users', colorGroup: 'Secondary', colorScale: '700', route: '/abm' }
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
	const navigate = useNavigate();

	return (
		<div className={styles.list} style={{ rowGap: spacing.sm }}>
			{ACCESS_ITEMS.map((item) => {
				const step = getColorStep(item.colorGroup, item.colorScale);

				return (
					<AccessButton
						key={item.title}
						title={item.title}
						iconName={item.iconName}
						backgroundColor={step.value}
						textColor={step.textColor}
						onClick={() => navigate(item.route)}
					/>
				);
			})}
		</div>
	);
};

export default AccessList;

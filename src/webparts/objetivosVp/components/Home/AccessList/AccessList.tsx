import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { spacing } from '../../../../../core/ui/foundations';
import type { FigmaIconName } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../../shared/getColorStep';
import { PALANCAS_PATH } from '../../ObjetivosVp/routes';
import AccessButton from './AccessButton';
import styles from './AccessList.module.scss';

interface IAccessItem {
	title: string;
	iconName: FigmaIconName;
	colorGroup: string;
	colorScale: string;
	route?: string;
}

const ACCESS_ITEMS: IAccessItem[] = [
	{ title: strings.AccessMyTasks, iconName: 'checkmark', colorGroup: 'Primary', colorScale: '800' },
	{ title: strings.AccessMyInitiatives, iconName: 'applications', colorGroup: 'Tertiary', colorScale: '800' },
	{ title: strings.AccessLeversObjectives, iconName: 'flag', colorGroup: 'Tertiary', colorScale: '500', route: PALANCAS_PATH },
	{ title: strings.AccessVpDashboard, iconName: 'list', colorGroup: 'Primary', colorScale: '600' },
	{ title: strings.AccessAbm, iconName: 'users', colorGroup: 'Secondary', colorScale: '700' }
];

const AccessList: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className={styles.list} style={{ rowGap: spacing.lg }}>
			{ACCESS_ITEMS.map((item) => {
				const step = getColorStep(item.colorGroup, item.colorScale);
				const route = item.route;

				return (
					<AccessButton
						key={item.title}
						title={item.title}
						iconName={item.iconName}
						backgroundColor={step.value}
						textColor={step.textColor}
						onClick={route ? () => navigate(route) : undefined}
					/>
				);
			})}
		</div>
	);
};

export default AccessList;

import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { spacing } from '../../../../../core/ui/foundations';
import type { FigmaIconName } from '../../../../../core/ui/foundations';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../../shared/getColorStep';
import { usePermisos } from '../../shared/PermisosProvider';
import { INICIATIVAS_PATH, PALANCAS_PATH, TAREAS_PATH } from '../../ObjetivosVp/routes';
import AccessButton from './AccessButton';
import styles from './AccessList.module.scss';

interface IAccessItem {
	title: string;
	iconName: FigmaIconName;
	colorGroup: string;
	colorScale: string;
	route?: string;
	soloAdministrador?: boolean;
}

const LIGHT_TEXT_COLOR = '#fcfcfc';

const ACCESS_ITEMS: IAccessItem[] = [
	{ title: strings.AccessMyTasks, iconName: 'checkmark', colorGroup: 'Primary', colorScale: '800', route: TAREAS_PATH },
	{ title: strings.AccessMyInitiatives, iconName: 'applications', colorGroup: 'Tertiary', colorScale: '800', route: INICIATIVAS_PATH },
	{ title: strings.AccessLeversObjectives, iconName: 'flag', colorGroup: 'Tertiary', colorScale: '200', route: PALANCAS_PATH },
	{ title: strings.AccessVpDashboard, iconName: 'list', colorGroup: 'Primary', colorScale: '300' },
	{ title: strings.AccessAbm, iconName: 'users', colorGroup: 'Secondary', colorScale: '700', soloAdministrador: true }
];

const AccessList: React.FC = () => {
	const navigate = useNavigate();
	const { permisos } = usePermisos();

	return (
		<div className={styles.list} style={{ rowGap: spacing.lg }}>
			{ACCESS_ITEMS.map((item) => {
				const step = getColorStep(item.colorGroup, item.colorScale);
				const route = item.route;

				const button = (
					<AccessButton
						title={item.title}
						iconName={item.iconName}
						backgroundColor={step.value}
						textColor={LIGHT_TEXT_COLOR}
						onClick={route ? () => navigate(route) : undefined}
					/>
				);

				return item.soloAdministrador && !permisos.canManageUsuarios
					? <div key={item.title} style={{ visibility: 'hidden' }} aria-hidden="true">{button}</div>
					: <React.Fragment key={item.title}>{button}</React.Fragment>;
			})}
		</div>
	);
};

export default AccessList;

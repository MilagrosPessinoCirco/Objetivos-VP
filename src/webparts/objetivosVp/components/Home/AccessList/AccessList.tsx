import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../../shared/getColorStep';
import { usePermisos } from '../../shared/PermisosProvider';
import { INICIATIVAS_PATH, PALANCAS_PATH, TAREAS_PATH } from '../../ObjetivosVp/routes';
import AccessButton from './AccessButton';
import styles from './AccessList.module.scss';

interface IAccessItem {
	title: string;
	icon: string;
	colorGroup: string;
	colorScale: string;
	route?: string;
	soloAdministrador?: boolean;
}

const LIGHT_TEXT_COLOR = '#fcfcfc';

const tareasIcon: string = require('../../../assets/home-tareas.svg');
const iniciativasIcon: string = require('../../../assets/home-iniciativas.svg');
const palancasIcon: string = require('../../../assets/home-palancas.svg');
const tableroIcon: string = require('../../../assets/home-tablero.svg');
const abmIcon: string = require('../../../assets/home-abm.svg');

const ACCESS_ITEMS: IAccessItem[] = [
	{ title: strings.AccessMyTasks, icon: tareasIcon, colorGroup: 'Primary', colorScale: '800', route: TAREAS_PATH },
	{ title: strings.AccessMyInitiatives, icon: iniciativasIcon, colorGroup: 'Tertiary', colorScale: '800', route: INICIATIVAS_PATH },
	{ title: strings.AccessLeversObjectives, icon: palancasIcon, colorGroup: 'Tertiary', colorScale: '400', route: PALANCAS_PATH },
	{ title: strings.AccessVpDashboard, icon: tableroIcon, colorGroup: 'Secondary', colorScale: '700' },
	{ title: strings.AccessAbm, icon: abmIcon, colorGroup: 'Secondary', colorScale: '800', soloAdministrador: true }
];

const AccessList: React.FC = () => {
	const navigate = useNavigate();
	const { permisos } = usePermisos();

	return (
		<div className={styles.list}>
			{ACCESS_ITEMS.map((item) => {
				const step = getColorStep(item.colorGroup, item.colorScale);
				const route = item.route;

				const button = (
					<AccessButton
						title={item.title}
						icon={item.icon}
						backgroundColor={step.value}
						textColor={LIGHT_TEXT_COLOR}
						onClick={route ? () => navigate(route) : undefined}
					/>
				);

				return item.soloAdministrador && !permisos.canManageUsuarios
					? <div key={item.title} className={styles.hidden} aria-hidden="true">{button}</div>
					: <React.Fragment key={item.title}>{button}</React.Fragment>;
			})}
		</div>
	);
};

export default AccessList;

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

	// Los botones miden siempre lo mismo (el alto se reparte entre todos los accesos posibles) y, si alguno
	// no corresponde al rol, los visibles quedan centrados en vertical.
	const listStyle = { '--access-slots': ACCESS_ITEMS.length } as React.CSSProperties;

	return (
		<div className={styles.list} style={listStyle}>
			{ACCESS_ITEMS.filter((item) => !item.soloAdministrador || permisos.canManageUsuarios).map((item) => {
				const step = getColorStep(item.colorGroup, item.colorScale);
				const route = item.route;

				return (
					<AccessButton
						key={item.title}
						title={item.title}
						icon={item.icon}
						backgroundColor={step.value}
						textColor={LIGHT_TEXT_COLOR}
						onClick={route ? () => navigate(route) : undefined}
					/>
				);
			})}
		</div>
	);
};

export default AccessList;

import * as React from 'react';
import { ThemeProvider } from '@fluentui/react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import Home from '../Home/Home';
import PalancaDetalle from '../PalancaDetalle/PalancaDetalle';
import Palancas from '../Palancas/Palancas';
import { HOME_PATH, PALANCAS_PATH, PALANCA_DETAIL_PATH } from './routes';
import styles from './ObjetivosVp.module.scss';

export interface IObjetivosVpProps {
	description: string;
}

const CAN_MANAGE_PALANCAS = true;

const ObjetivosVpRoutes: React.FC = () => (
	<Routes>
		<Route path={HOME_PATH} element={<Home />} />
		<Route path={PALANCAS_PATH} element={<Palancas canManage={CAN_MANAGE_PALANCAS} />} />
		<Route path={PALANCA_DETAIL_PATH} element={<PalancaDetalle canManage={CAN_MANAGE_PALANCAS} />} />
	</Routes>
);

const ObjetivosVp: React.FunctionComponent<IObjetivosVpProps> = () => {
	return (
		<ThemeProvider className={styles.objetivosVp}>
			<Router>
				<ObjetivosVpRoutes />
			</Router>
		</ThemeProvider>
	);
};

export default ObjetivosVp;

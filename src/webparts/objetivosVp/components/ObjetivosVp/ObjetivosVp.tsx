import * as React from 'react';
import { ThemeProvider } from '@fluentui/react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import Home from '../Home/Home';
import ObjetivoDetalle from '../Objetivo/ObjetivoDetalle/ObjetivoDetalle';
import ObjetivoForm from '../Objetivo/ObjetivoForm/ObjetivoForm';
import PalancaDetalle from '../Palanca/PalancaDetalle/PalancaDetalle';
import Palancas from '../Palanca/Palancas/Palancas';
import type { ObjetivosFiltro } from '../Objetivo/objetivoUtils';
import { HOME_PATH, OBJETIVO_DETAIL_PATH, OBJETIVO_EDIT_PATH, OBJETIVO_NEW_PATH, PALANCAS_PATH, PALANCA_DETAIL_PATH } from './routes';
import styles from './ObjetivosVp.module.scss';

export interface IObjetivosVpProps {
	description: string;
}

const CAN_MANAGE_PALANCAS = true;
const CAN_CREATE_OBJETIVO = true;
const CAN_EDIT_OBJETIVO = true;
const DEFAULT_FILTRO: ObjetivosFiltro = 'todos';

const ObjetivosVpRoutes: React.FC = () => {
	const [filtro, setFiltro] = React.useState<ObjetivosFiltro>(DEFAULT_FILTRO);

	return (
		<Routes>
			<Route path={HOME_PATH} element={<Home />} />
			<Route path={PALANCAS_PATH} element={<Palancas canManage={CAN_MANAGE_PALANCAS} canCreateObjetivo={CAN_CREATE_OBJETIVO} filtro={filtro} onFiltroChange={setFiltro} />} />
			<Route path={PALANCA_DETAIL_PATH} element={<PalancaDetalle canManage={CAN_MANAGE_PALANCAS} canCreateObjetivo={CAN_CREATE_OBJETIVO} filtro={filtro} />} />
			<Route path={OBJETIVO_NEW_PATH} element={<ObjetivoForm />} />
			<Route path={OBJETIVO_EDIT_PATH} element={<ObjetivoForm />} />
			<Route path={OBJETIVO_DETAIL_PATH} element={<ObjetivoDetalle canEditObjetivo={CAN_EDIT_OBJETIVO} />} />
		</Routes>
	);
};

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

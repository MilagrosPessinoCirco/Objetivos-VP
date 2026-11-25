import * as React from 'react';
import { ThemeProvider } from '@fluentui/react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import Home from '../Home/Home';
import IniciativaDetalle from '../Iniciativa/IniciativaDetalle/IniciativaDetalle';
import IniciativasBandeja from '../Iniciativa/IniciativasBandeja/IniciativasBandeja';
import type { IIniciativasBandejaState } from '../Iniciativa/IniciativasBandeja/IniciativasBandeja';
import { EMPTY_FILTROS } from '../Iniciativa/iniciativaUtils';
import ObjetivoDetalle from '../Objetivo/ObjetivoDetalle/ObjetivoDetalle';
import PalancaDetalle from '../Palanca/PalancaDetalle/PalancaDetalle';
import Palancas from '../Palanca/Palancas/Palancas';
import TareaDetalle from '../Tarea/TareaDetalle/TareaDetalle';
import TareasBandeja from '../Tarea/TareasBandeja/TareasBandeja';
import type { ITareasBandejaState } from '../Tarea/TareasBandeja/TareasBandeja';
import { EMPTY_TAREAS_FILTROS } from '../Tarea/tareaUtils';
import { EstadoTarea } from '../../../../core/utils/Constants';
import type { ObjetivosFiltro } from '../Objetivo/objetivoUtils';
import { HOME_PATH, INICIATIVAS_PATH, INICIATIVA_DETAIL_PATH, OBJETIVO_DETAIL_PATH, PALANCAS_PATH, PALANCA_DETAIL_PATH, TAREAS_PATH, TAREA_DETAIL_PATH } from './routes';
import styles from './ObjetivosVp.module.scss';

export interface IObjetivosVpProps {
	description: string;
}

const CAN_MANAGE_PALANCAS = true;
const CAN_CREATE_OBJETIVO = true;
const CAN_EDIT_OBJETIVO = true;
const CAN_CREATE_INICIATIVA = true;
const CAN_EDIT_INICIATIVA = true;
const CAN_CHANGE_ESTADO_INICIATIVA = true;
const CAN_LOAD_RESULTADOS_CLAVE = true;
const CAN_TRACK_RESULTADO_CLAVE = true;
const CAN_CREATE_TAREA = true;
const CAN_EDIT_TAREA = true;
const CAN_REGISTER_PROGRESS_TAREA = true;
const CAN_CREATE_RIESGO = true;
const CAN_EDIT_RIESGO = true;
const DEFAULT_FILTRO: ObjetivosFiltro = 'todos';
const DEFAULT_BANDEJA_STATE: IIniciativasBandejaState = { searchText: '', filtros: EMPTY_FILTROS, page: 1 };
const DEFAULT_TAREAS_BANDEJA_STATE: ITareasBandejaState = { searchText: '', filtros: EMPTY_TAREAS_FILTROS, estado: EstadoTarea.EnCurso, page: 1 };

const ObjetivosVpRoutes: React.FC = () => {
	const [filtro, setFiltro] = React.useState<ObjetivosFiltro>(DEFAULT_FILTRO);
	const [bandejaState, setBandejaState] = React.useState<IIniciativasBandejaState>(DEFAULT_BANDEJA_STATE);
	const [tareasBandejaState, setTareasBandejaState] = React.useState<ITareasBandejaState>(DEFAULT_TAREAS_BANDEJA_STATE);

	return (
		<Routes>
			<Route path={HOME_PATH} element={<Home />} />
			<Route path={PALANCAS_PATH} element={<Palancas canManage={CAN_MANAGE_PALANCAS} canCreateObjetivo={CAN_CREATE_OBJETIVO} filtro={filtro} onFiltroChange={setFiltro} />} />
			<Route path={PALANCA_DETAIL_PATH} element={<PalancaDetalle canManage={CAN_MANAGE_PALANCAS} canCreateObjetivo={CAN_CREATE_OBJETIVO} filtro={filtro} />} />
			<Route path={INICIATIVAS_PATH} element={<IniciativasBandeja canCreate={CAN_CREATE_INICIATIVA} canLoadResultadosClave={CAN_LOAD_RESULTADOS_CLAVE} state={bandejaState} onStateChange={setBandejaState} />} />
			<Route path={INICIATIVA_DETAIL_PATH} element={<IniciativaDetalle canEdit={CAN_EDIT_INICIATIVA} canChangeEstado={CAN_CHANGE_ESTADO_INICIATIVA} canLoadResultadosClave={CAN_LOAD_RESULTADOS_CLAVE} canTrackResultadoClave={CAN_TRACK_RESULTADO_CLAVE} canCreateTarea={CAN_CREATE_TAREA} />} />
			<Route path={TAREAS_PATH} element={<TareasBandeja canCreate={CAN_CREATE_TAREA} state={tareasBandejaState} onStateChange={setTareasBandejaState} />} />
			<Route path={TAREA_DETAIL_PATH} element={<TareaDetalle canEdit={CAN_EDIT_TAREA} canRegisterProgress={CAN_REGISTER_PROGRESS_TAREA} canCreateRiesgo={CAN_CREATE_RIESGO} canEditRiesgo={CAN_EDIT_RIESGO} />} />
			<Route path={OBJETIVO_DETAIL_PATH} element={<ObjetivoDetalle canEditObjetivo={CAN_EDIT_OBJETIVO} canCreateIniciativa={CAN_CREATE_INICIATIVA} canLoadResultadosClave={CAN_LOAD_RESULTADOS_CLAVE} />} />
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

import * as React from 'react';
import { ThemeProvider } from '@fluentui/react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import Home from '../Home/Home';
import IniciativaDetalle from '../Iniciativa/IniciativaDetalle/IniciativaDetalle';
import IniciativasBandeja from '../Iniciativa/IniciativasBandeja/IniciativasBandeja';
import type { IIniciativasBandejaState } from '../Iniciativa/IniciativasBandeja/IniciativasBandeja';
import { EMPTY_FILTROS } from '../Iniciativa/iniciativaUtils';
import ObjetivoDetalle from '../Objetivo/ObjetivoDetalle/ObjetivoDetalle';
import { PermisosProvider, usePermisos } from '../shared/PermisosProvider';
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

const DEFAULT_FILTRO: ObjetivosFiltro = 'todos';
const DEFAULT_BANDEJA_STATE: IIniciativasBandejaState = { searchText: '', filtros: EMPTY_FILTROS, page: 1 };
const DEFAULT_TAREAS_BANDEJA_STATE: ITareasBandejaState = { searchText: '', filtros: EMPTY_TAREAS_FILTROS, estado: EstadoTarea.EnCurso, page: 1 };

const ObjetivosVpRoutes: React.FC = () => {
	const { permisos } = usePermisos();
	const [filtro, setFiltro] = React.useState<ObjetivosFiltro>(DEFAULT_FILTRO);
	const [bandejaState, setBandejaState] = React.useState<IIniciativasBandejaState>(DEFAULT_BANDEJA_STATE);
	const [tareasBandejaState, setTareasBandejaState] = React.useState<ITareasBandejaState>(DEFAULT_TAREAS_BANDEJA_STATE);

	return (
		<Routes>
			<Route path={HOME_PATH} element={<Home />} />
			<Route path={PALANCAS_PATH} element={<Palancas canManage={permisos.canManagePalancas} canCreateObjetivo={permisos.canCreateObjetivo} filtro={filtro} onFiltroChange={setFiltro} />} />
			<Route path={PALANCA_DETAIL_PATH} element={<PalancaDetalle canManage={permisos.canManagePalancas} canCreateObjetivo={permisos.canCreateObjetivo} filtro={filtro} />} />
			<Route path={INICIATIVAS_PATH} element={<IniciativasBandeja canCreate={permisos.canCreateIniciativa} canLoadResultadosClave={permisos.canLoadResultadosClave} canViewPesos={permisos.canViewPesos} state={bandejaState} onStateChange={setBandejaState} />} />
			<Route path={INICIATIVA_DETAIL_PATH} element={<IniciativaDetalle canEdit={permisos.canEditIniciativa} canChangeEstado={permisos.canEditIniciativa} canLoadResultadosClave={permisos.canLoadResultadosClave} canTrackResultadoClave={permisos.canTrackResultadoClave} canCreateTarea={permisos.canCreateTarea} canViewPesos={permisos.canViewPesos} />} />
			<Route path={TAREAS_PATH} element={<TareasBandeja canCreate={permisos.canCreateTarea} state={tareasBandejaState} onStateChange={setTareasBandejaState} />} />
			<Route path={TAREA_DETAIL_PATH} element={<TareaDetalle canEdit={permisos.canUpdateTarea} canRegisterProgress={permisos.canUpdateTarea} />} />
			<Route path={OBJETIVO_DETAIL_PATH} element={<ObjetivoDetalle canEditObjetivo={permisos.canEditObjetivo} canCreateIniciativa={permisos.canCreateIniciativa} canLoadResultadosClave={permisos.canLoadResultadosClave} canViewPesos={permisos.canViewPesos} />} />
		</Routes>
	);
};

const ObjetivosVp: React.FunctionComponent<IObjetivosVpProps> = () => {
	return (
		<ThemeProvider className={styles.objetivosVp}>
			<PermisosProvider>
				<Router>
					<ObjetivosVpRoutes />
				</Router>
			</PermisosProvider>
		</ThemeProvider>
	);
};

export default ObjetivosVp;

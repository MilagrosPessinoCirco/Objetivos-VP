import * as React from 'react';
import type { CSSProperties } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '../../../../../core/ui/components';
import { MessageBar, Spinner, Tabs } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import useDepartamentoDataSource from '../../../../../core/api/Departamento/useDepartamentoDataSource';
import useIniciativaDataSource from '../../../../../core/api/Iniciativa/useIniciativaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import useTareaDataSource from '../../../../../core/api/Tarea/useTareaDataSource';
import useCurrentUser from '../../../../../core/api/Usuario/useCurrentUser';
import { Objetivo, Tarea } from '../../../../../core/entities';
import { EstadoTarea } from '../../../../../core/utils/Constants';
import { IPersonValue } from '../../../../../core/utils/Mappers';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../../shared/getColorStep';
import SuccessNotice from '../../shared/SuccessNotice/SuccessNotice';
import { HOME_PATH, TAREAS_VISTA_PARAM, TAREAS_VISTA_TODAS, getTareaPath } from '../../ObjetivosVp/routes';
import useObjetivoNames from '../../Objetivo/useObjetivoNames';
import IniciativasHeader from '../../Iniciativa/IniciativasBandeja/IniciativasHeader/IniciativasHeader';
import IniciativasPaginador from '../../Iniciativa/IniciativasBandeja/IniciativasPaginador/IniciativasPaginador';
import TareaFormPanel from '../TareaForm/TareaFormPanel';
import TareasFiltros from './TareasFiltros/TareasFiltros';
import TareasTable from '../TareasTable/TareasTable';
import { FIRST_PAGE, TAREAS_PAGE_SIZE, paginarTareas } from '../tareaPaginado';
import { ITareasFiltros, EMPTY_TAREAS_FILTROS, TareasVista, getAniosObjetivo, matchesTareaSearch, matchesTareasFiltros } from '../tareaUtils';
import styles from './TareasBandeja.module.scss';

export interface ITareasBandejaState {
	searchText: string;
	filtros: ITareasFiltros;
	estado: EstadoTarea;
	page: number;
}

export interface ITareasBandejaProps {
	canCreate: boolean;
	state: ITareasBandejaState;
	onStateChange: (state: ITareasBandejaState) => void;
}

const PAGER_SPACE = '96px';

const SUBSOLAPAS: { estado: EstadoTarea; label: string }[] = [
	{ estado: EstadoTarea.EnCurso, label: strings.TareasStateInProgress },
	{ estado: EstadoTarea.Frenada, label: strings.TareasStateStopped },
	{ estado: EstadoTarea.NoIniciada, label: strings.TareasStateNotStarted },
	{ estado: EstadoTarea.Finalizada, label: strings.TareasStateFinished },
	{ estado: EstadoTarea.Cancelada, label: strings.TareasStateCancelled }
];

const SUMMARY_STYLE: CSSProperties = {
	margin: `0 0 0 ${spacing.md}`,
	fontSize: typography.size[12],
	lineHeight: typography.lineHeight[12],
	fontWeight: typography.weight.semibold,
	color: getColorStep('Primary', '600').value
};

const getResponsables = (tareas: Tarea[]): IPersonValue[] =>
	tareas
		.reduce<IPersonValue[]>((personas, tarea) => (tarea.Responsable ? personas.concat([tarea.Responsable]) : personas), [])
		.filter((persona, index, personas) => personas.findIndex((other) => other.Id === persona.Id) === index);

const getAnios = (objetivos: Objetivo[]): number[] => {
	const anios = objetivos.reduce<number[]>((all, objetivo) => all.concat(getAniosObjetivo(objetivo)), []);
	if (anios.length === 0) {
		return [];
	}
	const first = Math.min(...anios);
	return Array.from({ length: Math.max(...anios) - first + 1 }, (_, index) => first + index);
};

const TareasBandeja: React.FC<ITareasBandejaProps> = ({ canCreate, state, onStateChange }) => {
	const [tareaState, getTareas, , , , , reloadTareas] = useTareaDataSource();
	const [iniciativaState, getIniciativas, , , , , reloadIniciativas] = useIniciativaDataSource();
	const [objetivoState, getObjetivos, , , , , reloadObjetivos] = useObjetivoDataSource();
	const [departamentoState, getDepartamentos, , , , , reloadDepartamentos] = useDepartamentoDataSource();
	const names = useObjetivoNames();
	const currentUser = useCurrentUser();
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const [ready, setReady] = React.useState<boolean>(false);
	const [attempt, setAttempt] = React.useState<number>(0);
	const [loadFailed, setLoadFailed] = React.useState<boolean>(false);
	const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
	const [isFiltersOpen, setIsFiltersOpen] = React.useState<boolean>(false);
	const [noticeMessage, setNoticeMessage] = React.useState<string | undefined>(undefined);
	const closeNotice = React.useCallback((): void => setNoticeMessage(undefined), []);

	React.useEffect(() => {
		setReady(false);
		setLoadFailed(false);
		Promise.all([getTareas(), getIniciativas(), getObjetivos(), getDepartamentos()])
			.then(() => setReady(true))
			.catch(() => setLoadFailed(true));
	}, [attempt]);

	const refresh = (): void => {
		Promise.all([reloadTareas(), reloadIniciativas(), reloadObjetivos(), reloadDepartamentos()])
			.then(() => setNoticeMessage(strings.ViewRefreshed))
			.catch(() => undefined);
	};

	const vista: TareasVista = searchParams.get(TAREAS_VISTA_PARAM) === TAREAS_VISTA_TODAS ? 'todas' : 'mis';
	const tareas = tareaState.items;
	const mias = tareas.filter((tarea) => tarea.Responsable?.Id === currentUser.user?.Id);
	const deLaVista = vista === 'mis' ? mias : tareas;
	const loadError = loadFailed || tareaState.error || iniciativaState.error || objetivoState.error || departamentoState.error || names.error;
	const hasFiltros = state.searchText.trim() !== '' || Object.values(state.filtros).some((valor) => valor !== '');
	const search = state.searchText.trim().toLowerCase();
	const objetivos = names.resolve(objetivoState.items);
	const visibles = deLaVista.filter((tarea) => matchesTareaSearch(tarea, search) && matchesTareasFiltros(tarea, state.filtros, iniciativaState.items, objetivos));
	const deLaSubsolapa = visibles.filter((tarea) => tarea.Estado === state.estado);
	const pagina = paginarTareas(deLaSubsolapa, state.page);
	const emptyText = deLaVista.length === 0 ? strings.TareasEmpty : hasFiltros ? strings.TareasEmptyFilters : strings.TareasEmptyState;

	const changeVista = (key: string): void => {
		setSearchParams(key === TAREAS_VISTA_TODAS ? { [TAREAS_VISTA_PARAM]: TAREAS_VISTA_TODAS } : {}, { replace: true });
		onStateChange({ ...state, page: FIRST_PAGE });
	};

	const applyFiltros = (filtros: ITareasFiltros): void => {
		setIsFiltersOpen(false);
		onStateChange({ ...state, filtros, page: FIRST_PAGE });
	};

	const changeEstado = (key: string): void => {
		const estado = SUBSOLAPAS.filter((item) => item.estado === key)[0]?.estado ?? state.estado;
		onStateChange({ ...state, estado, page: FIRST_PAGE });
	};

	const onCreated = (tarea: Tarea): void => {
		setIsFormOpen(false);
		getTareas();
		setNoticeMessage(Utils.replaceAll(strings.TareaCreated, '{0}', tarea.Nombre ?? ''));
	};

	const openTarea = (id: number): void => {
		navigate(getTareaPath(id), { state: { from: location.pathname + location.search } });
	};

	const renderBody = (): React.ReactNode => {
		if (loadError) {
			return (
				<MessageBar
					type="error"
					message={strings.TareasLoadError}
					actions={<Button variant="secondary" onClick={() => setAttempt(attempt + 1)}>{strings.TareasRetry}</Button>}
				/>
			);
		}
		if (!ready || !names.ready) {
			return <Spinner />;
		}
		return (
			<>
				{currentUser.error && <MessageBar type="error" message={strings.TareasLoadError} />}
				<p style={SUMMARY_STYLE}>{Utils.replaceAll(strings.TareasCount, '{0}', String(visibles.length))}</p>
				<Tabs
					className={styles.tabs}
					variant="transparent"
					ariaLabel={strings.TareasTabsAriaLabel}
					items={[
						{ key: 'mis', label: `${strings.AccessMyTasks} (${mias.length})` },
						{ key: TAREAS_VISTA_TODAS, label: `${strings.IniciativasTabAll} (${tareas.length})` }
					]}
					value={vista}
					onChange={changeVista}
				/>
				<Tabs
					variant="subtle"
					size="small"
					ariaLabel={strings.TareasStateTabsAriaLabel}
					items={SUBSOLAPAS.map((item) => ({
						key: item.estado,
						label: `${item.label} (${visibles.filter((tarea) => tarea.Estado === item.estado).length})`
					}))}
					value={state.estado}
					onChange={changeEstado}
				/>
				<TareasTable tareas={pagina.pageItems} variant="bandeja" iniciativas={iniciativaState.items} emptyText={emptyText} onView={openTarea} />
				<IniciativasPaginador page={pagina.page} pageSize={TAREAS_PAGE_SIZE} total={pagina.total} onPageChange={(next) => onStateChange({ ...state, page: next })} />
			</>
		);
	};

	return (
		<>
			<SuccessNotice message={noticeMessage} onClose={closeNotice} />
			<div className={styles.bandeja} style={{ gap: spacing.lg, padding: `${spacing.xl} ${spacing.xl} ${PAGER_SPACE}` }}>
				<IniciativasHeader
					title={vista === 'mis' ? strings.AccessMyTasks : strings.TareasAllTitle}
					searchText={state.searchText}
					searchPlaceholder={strings.TareasSearchPlaceholder}
					newLabel={strings.TareaNew}
					onSearchChange={(searchText) => onStateChange({ ...state, searchText, page: FIRST_PAGE })}
					onBack={() => navigate(HOME_PATH)}
						onRefresh={refresh}
					onOpenFilters={() => setIsFiltersOpen(true)}
					canCreate={canCreate}
					onNew={() => setIsFormOpen(true)}
				/>
				{renderBody()}
				{isFiltersOpen && (
					<TareasFiltros
						filtros={state.filtros}
						departamentos={departamentoState.items}
						objetivos={objetivos}
						iniciativas={iniciativaState.items}
						responsables={getResponsables(tareas)}
						anios={getAnios(objetivos)}
						onApply={applyFiltros}
						onClear={() => applyFiltros(EMPTY_TAREAS_FILTROS)}
						onClose={() => setIsFiltersOpen(false)}
					/>
				)}
				{isFormOpen && <TareaFormPanel onSaved={onCreated} onCancel={() => setIsFormOpen(false)} />}
			</div>
		</>
	);
};

export default TareasBandeja;

import * as React from 'react';
import type { CSSProperties } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { MessageBar, Spinner, Tabs } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import useDepartamentoDataSource from '../../../../../core/api/Departamento/useDepartamentoDataSource';
import useIniciativaDataSource from '../../../../../core/api/Iniciativa/useIniciativaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import useCurrentUser from '../../../../../core/api/Usuario/useCurrentUser';
import { Iniciativa, Objetivo } from '../../../../../core/entities';
import { IPersonValue } from '../../../../../core/utils/Mappers';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../../shared/getColorStep';
import SuccessNotice from '../../shared/SuccessNotice/SuccessNotice';
import { HOME_PATH, INICIATIVAS_VISTA_PARAM, INICIATIVAS_VISTA_TODAS, getIniciativaPath } from '../../ObjetivosVp/routes';
import IniciativaFormPanel from '../IniciativaForm/IniciativaFormPanel';
import IniciativasTable from '../IniciativasTable/IniciativasTable';
import { EMPTY_FILTROS, IIniciativasFiltros, IniciativasVista, formatIniciativaId, getAniosIniciativa, isAccountable } from '../iniciativaUtils';
import IniciativasFiltros from './IniciativasFiltros/IniciativasFiltros';
import IniciativasHeader from './IniciativasHeader/IniciativasHeader';
import IniciativasPaginador from './IniciativasPaginador/IniciativasPaginador';
import styles from './IniciativasBandeja.module.scss';

export interface IIniciativasBandejaState {
	searchText: string;
	filtros: IIniciativasFiltros;
	page: number;
}

export interface IIniciativasBandejaProps {
	canCreate: boolean;
	state: IIniciativasBandejaState;
	onStateChange: (state: IIniciativasBandejaState) => void;
}

const PAGE_SIZE = 10;
const FIRST_PAGE = 1;
const PAGER_SPACE = '96px';

const SUMMARY_STYLE: CSSProperties = {
	margin: `0 0 0 ${spacing.md}`,
	fontSize: typography.size[12],
	lineHeight: typography.lineHeight[12],
	fontWeight: typography.weight.semibold,
	color: getColorStep('Primary', '600').value
};

const matchesSearch = (iniciativa: Iniciativa, search: string): boolean =>
	formatIniciativaId(iniciativa.Id).toLowerCase().indexOf(search) >= 0 ||
	(iniciativa.Nombre ?? '').toLowerCase().indexOf(search) >= 0;

const matchesFiltros = (iniciativa: Iniciativa, filtros: IIniciativasFiltros, objetivos: Objetivo[]): boolean => {
	const objetivo = objetivos.filter((item) => item.Id === iniciativa.Objetivo?.Id)[0];
	return (filtros.departamentoId === '' || String(objetivo?.Departamento?.Id) === filtros.departamentoId) &&
		(filtros.objetivoId === '' || String(iniciativa.Objetivo?.Id) === filtros.objetivoId) &&
		(filtros.accountableId === '' || String(iniciativa.Accountable?.Id) === filtros.accountableId) &&
		(filtros.estado === '' || iniciativa.Estado === filtros.estado) &&
		(filtros.anio === '' || getAniosIniciativa(iniciativa).indexOf(Number(filtros.anio)) >= 0);
};

const getAccountables = (iniciativas: Iniciativa[]): IPersonValue[] =>
	iniciativas
		.reduce<IPersonValue[]>((personas, iniciativa) => (iniciativa.Accountable ? personas.concat([iniciativa.Accountable]) : personas), [])
		.filter((persona, index, personas) => personas.findIndex((other) => other.Id === persona.Id) === index);

const getAnios = (iniciativas: Iniciativa[]): number[] => {
	const anios = iniciativas.reduce<number[]>((all, iniciativa) => all.concat(getAniosIniciativa(iniciativa)), []);
	if (anios.length === 0) {
		return [];
	}
	const first = Math.min(...anios);
	return Array.from({ length: Math.max(...anios) - first + 1 }, (_, index) => first + index);
};

const IniciativasBandeja: React.FC<IIniciativasBandejaProps> = ({ canCreate, state, onStateChange }) => {
	const [iniciativaState, getIniciativas] = useIniciativaDataSource();
	const [objetivoState, getObjetivos] = useObjetivoDataSource();
	const [departamentoState, getDepartamentos] = useDepartamentoDataSource();
	const currentUser = useCurrentUser();
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const [ready, setReady] = React.useState<boolean>(false);
	const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
	const [isFiltersOpen, setIsFiltersOpen] = React.useState<boolean>(false);
	const [noticeMessage, setNoticeMessage] = React.useState<string | undefined>(undefined);
	const closeNotice = React.useCallback((): void => setNoticeMessage(undefined), []);

	React.useEffect(() => {
		Promise.all([getIniciativas(), getObjetivos(), getDepartamentos()]).then(() => setReady(true));
	}, []);

	const vista: IniciativasVista = searchParams.get(INICIATIVAS_VISTA_PARAM) === INICIATIVAS_VISTA_TODAS ? 'todas' : 'mis';
	const iniciativas = iniciativaState.items;
	const objetivos = objetivoState.items;
	const mias = iniciativas.filter((iniciativa) => isAccountable(iniciativa, currentUser.user?.Id));
	const deLaVista = vista === 'mis' ? mias : iniciativas;
	const search = state.searchText.trim().toLowerCase();
	const visibles = deLaVista.filter((iniciativa) => matchesSearch(iniciativa, search) && matchesFiltros(iniciativa, state.filtros, objetivos));

	const lastPage = Math.max(FIRST_PAGE, Math.ceil(visibles.length / PAGE_SIZE));
	const page = Math.min(Math.max(FIRST_PAGE, state.page), lastPage);
	const pageItems = visibles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const loadError = iniciativaState.error || objetivoState.error || departamentoState.error;

	const changeVista = (key: string): void => {
		setSearchParams(key === INICIATIVAS_VISTA_TODAS ? { [INICIATIVAS_VISTA_PARAM]: INICIATIVAS_VISTA_TODAS } : {}, { replace: true });
		onStateChange({ ...state, page: FIRST_PAGE });
	};

	const applyFiltros = (filtros: IIniciativasFiltros): void => {
		setIsFiltersOpen(false);
		onStateChange({ ...state, filtros, page: FIRST_PAGE });
	};

	const openIniciativa = (id: number): void => {
		navigate(getIniciativaPath(id), { state: { from: location.pathname + location.search } });
	};

	const onCreated = (iniciativa: Iniciativa): void => {
		setIsFormOpen(false);
		getIniciativas();
		setNoticeMessage(Utils.replaceAll(strings.IniciativaCreated, '{0}', iniciativa.Nombre ?? ''));
	};

	const renderBody = (): React.ReactNode => {
		if (loadError) {
			return <MessageBar type="error" message={strings.IniciativasLoadError} />;
		}
		if (!ready) {
			return <Spinner />;
		}
		return (
			<>
				{currentUser.error && <MessageBar type="error" message={strings.IniciativasLoadError} />}
				<p style={SUMMARY_STYLE}>{Utils.replaceAll(strings.IniciativasCount, '{0}', String(visibles.length))}</p>
				<Tabs
					className={styles.tabs}
					variant="transparent"
					ariaLabel={strings.IniciativasTabsAriaLabel}
					items={[
						{ key: 'mis', label: `${strings.IniciativasMine} (${mias.length})` },
						{ key: INICIATIVAS_VISTA_TODAS, label: `${strings.IniciativasTabAll} (${iniciativas.length})` }
					]}
					value={vista}
					onChange={changeVista}
				/>
				<IniciativasTable
					iniciativas={pageItems}
					variant="bandeja"
					objetivos={objetivos}
					emptyText={deLaVista.length === 0 ? strings.IniciativasEmpty : strings.IniciativasEmptyFilters}
					onView={openIniciativa}
				/>
				<IniciativasPaginador page={page} pageSize={PAGE_SIZE} total={visibles.length} onPageChange={(next) => onStateChange({ ...state, page: next })} />
			</>
		);
	};

	return (
		<>
			<SuccessNotice message={noticeMessage} onClose={closeNotice} />
			<div className={styles.bandeja} style={{ gap: spacing.lg, padding: `${spacing.xl} ${spacing.xl} ${PAGER_SPACE}` }}>
				<IniciativasHeader
					title={vista === 'mis' ? strings.IniciativasMine : strings.IniciativasAllTitle}
					searchText={state.searchText}
					onSearchChange={(searchText) => onStateChange({ ...state, searchText, page: FIRST_PAGE })}
					onBack={() => navigate(HOME_PATH)}
					onOpenFilters={() => setIsFiltersOpen(true)}
					canCreate={canCreate}
					onNew={() => setIsFormOpen(true)}
				/>
				{renderBody()}
				{isFiltersOpen && (
					<IniciativasFiltros
						filtros={state.filtros}
						departamentos={departamentoState.items}
						objetivos={objetivos}
						accountables={getAccountables(iniciativas)}
						anios={getAnios(iniciativas)}
						onApply={applyFiltros}
						onClear={() => applyFiltros(EMPTY_FILTROS)}
						onClose={() => setIsFiltersOpen(false)}
					/>
				)}
				{isFormOpen && <IniciativaFormPanel onSaved={onCreated} onCancel={() => setIsFormOpen(false)} />}
			</div>
		</>
	);
};

export default IniciativasBandeja;

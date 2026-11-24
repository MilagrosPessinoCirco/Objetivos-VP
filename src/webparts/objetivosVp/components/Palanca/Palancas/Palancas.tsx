import * as React from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import { MessageBar, Spinner, Tabs } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import { Objetivo, Palanca } from '../../../../../core/entities';
import usePalancaDataSource from '../../../../../core/api/Palanca/usePalancaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import useIniciativaDataSource from '../../../../../core/api/Iniciativa/useIniciativaDataSource';
import useResultadoClaveDataSource from '../../../../../core/api/ResultadoClave/useResultadoClaveDataSource';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../../shared/getColorStep';
import { HOME_PATH, getObjetivoPath, getPalancaPath } from '../../ObjetivosVp/routes';
import ObjetivosTable from '../../Objetivo/ObjetivosTable/ObjetivosTable';
import IniciativasPaginador from '../../Iniciativa/IniciativasBandeja/IniciativasPaginador/IniciativasPaginador';
import ObjetivosFiltros from '../../Objetivo/ObjetivosFiltros/ObjetivosFiltros';
import { EMPTY_OBJETIVOS_FILTROS, IObjetivosFiltros, getAniosObjetivos, hasObjetivoFilter, matchesObjetivoFiltros } from '../../Objetivo/objetivoFiltros';
import { ObjetivosFiltro, filterObjetivos, formatObjetivoId, isVpRrii } from '../../Objetivo/objetivoUtils';
import useObjetivoNames from '../../Objetivo/useObjetivoNames';
import ObjetivoFormPanel from '../../Objetivo/ObjetivoForm/ObjetivoFormPanel';
import SuccessNotice from '../../shared/SuccessNotice/SuccessNotice';
import PalancaForm from '../PalancaForm/PalancaForm';
import { formatPalancaId } from '../formatPalancaId';
import PalancasHeader from './PalancasHeader/PalancasHeader';
import PalancasTable from './PalancasTable/PalancasTable';
import styles from './Palancas.module.scss';

export interface IPalancasProps {
	canManage: boolean;
	canCreateObjetivo: boolean;
	filtro: ObjetivosFiltro;
	onFiltroChange: (filtro: ObjetivosFiltro) => void;
}

const PAGE_SIZE = 10;
const FIRST_PAGE = 1;
const PAGER_SPACE = '96px';

type Operation = 'load' | 'save';

type FormState = { mode: 'new' } | { mode: 'edit'; palanca: Palanca };


const SUMMARY_STYLE: CSSProperties = { margin: `0 0 0 ${spacing.md}`, fontSize: typography.size[12], lineHeight: typography.lineHeight[12], fontWeight: typography.weight.semibold, color: getColorStep('Primary', '600').value };

const byNombre = (a: Palanca, b: Palanca): number => (a.Nombre ?? '').localeCompare(b.Nombre ?? '', 'es');

const matchesSearch = (palanca: Palanca, search: string): boolean =>
	formatPalancaId(palanca.Id).toLowerCase().indexOf(search) >= 0 ||
	(palanca.Nombre ?? '').toLowerCase().indexOf(search) >= 0;

const matchesObjetivo = (objetivo: Objetivo, search: string): boolean =>
	formatObjetivoId(objetivo.Id).toLowerCase().indexOf(search) >= 0 ||
	(objetivo.Nombre ?? '').toLowerCase().indexOf(search) >= 0;

const Palancas: React.FC<IPalancasProps> = ({ canManage, canCreateObjetivo, filtro, onFiltroChange }) => {
	const [state, getItems, addItem, editItem, , , reloadPalancas] = usePalancaDataSource();
	const [objetivoState, getObjetivos, , , , , reloadObjetivos] = useObjetivoDataSource();
	const [iniciativaState, getIniciativas, , , , , reloadIniciativas] = useIniciativaDataSource();
	const [resultadoState, getResultados, , , , , reloadResultados] = useResultadoClaveDataSource();
	const names = useObjetivoNames();
	const navigate = useNavigate();
	const [searchText, setSearchText] = React.useState<string>('');
	const [lastOperation, setLastOperation] = React.useState<Operation>('load');
	const [form, setForm] = React.useState<FormState | undefined>(undefined);
	const [isObjetivoFormOpen, setIsObjetivoFormOpen] = React.useState<boolean>(false);
	const [successMessage, setSuccessMessage] = React.useState<string | undefined>(undefined);
	const [filtros, setFiltros] = React.useState<IObjetivosFiltros>(EMPTY_OBJETIVOS_FILTROS);
	const [isFiltersOpen, setIsFiltersOpen] = React.useState<boolean>(false);
	const [requestedPage, setPage] = React.useState<number>(FIRST_PAGE);

	const loadObjetivos = (): void => {
		getObjetivos();
		getIniciativas();
		getResultados();
	};

	React.useEffect(() => {
		getItems();
		loadObjetivos();
	}, []);

	const refresh = (): void => {
		setLastOperation('load');
		Promise.all([reloadPalancas(), reloadObjetivos(), reloadIniciativas(), reloadResultados()])
			.then(() => setSuccessMessage(strings.ViewRefreshed))
			.catch(() => undefined);
	};

	const applyFiltros = (applied: IObjetivosFiltros): void => {
		setIsFiltersOpen(false);
		setFiltros(applied);
		setPage(FIRST_PAGE);
	};

	const closeNotice = React.useCallback((): void => setSuccessMessage(undefined), []);

	const createPalanca = async (palanca: Palanca): Promise<void> => {
		setLastOperation('save');
		await addItem(palanca);
		setForm(undefined);
		setSuccessMessage(Utils.replaceAll(strings.PalancaCreated, '{0}', palanca.Nombre ?? ''));
	};

	const updatePalanca = async (palanca: Palanca): Promise<void> => {
		setLastOperation('save');
		await editItem(palanca);
		setForm(undefined);
		setSuccessMessage(Utils.replaceAll(strings.PalancaUpdated, '{0}', palanca.Nombre ?? ''));
	};

	const onObjetivoCreated = (objetivo: Objetivo): void => {
		setIsObjetivoFormOpen(false);
		loadObjetivos();
		setSuccessMessage(Utils.replaceAll(strings.ObjetivoCreated, '{0}', objetivo.Nombre ?? ''));
	};

	const search = searchText.trim().toLowerCase();
	const emptyText = search === '' ? strings.PalancasEmpty : strings.PalancasEmptySearch;
	const hasAnyFilter = filtros.palancaId !== '' || hasObjetivoFilter(filtros);
	const objetivosEmptyText = (defaultText: string): string => hasAnyFilter ? strings.PalancasFiltersEmpty : search === '' ? defaultText : strings.ObjetivosEmptySearch;
	const byFiltros = (items: Objetivo[]): Objetivo[] => items.filter((objetivo) => matchesObjetivoFiltros(objetivo, filtros));
	const bySearch = (items: Objetivo[]): Objetivo[] => search === '' ? items : items.filter((objetivo) => matchesObjetivo(objetivo, search));

	const objetivosError = objetivoState.error || names.error || iniciativaState.error || resultadoState.error;
	const objetivosReady = !objetivosError && !objetivoState.isLoading && !iniciativaState.isLoading && !resultadoState.isLoading && names.ready;
	const objetivos = objetivosReady ? names.resolve(objetivoState.items) : [];
	const objetivosOfPalanca = (palancaId: number | undefined): Objetivo[] =>
		byFiltros(filterObjetivos(objetivos, filtro).filter((objetivo) => objetivo.Palanca?.Id === palancaId));

	// Como en el prototipo: una palanca se muestra si coincide ella (con todos sus objetivos, salvo que alguno coincida) o alguno de sus objetivos (solo los que coinciden).
	const palancaRows = state.items
		.filter((palanca) => palanca.Activa === true && (filtros.palancaId === '' || String(palanca.Id) === filtros.palancaId))
		.map((palanca) => {
			const own = objetivosReady ? objetivosOfPalanca(palanca.Id) : undefined;
			const matching = own ? bySearch(own) : [];
			const visibleObjetivos = own && search !== '' && matchesSearch(palanca, search) && matching.length === 0 ? own : matching;
			return { palanca, visibleObjetivos: own ? (search === '' ? own : visibleObjetivos) : undefined };
		})
		.filter(({ palanca, visibleObjetivos }) => search === '' || matchesSearch(palanca, search) || (visibleObjetivos?.length ?? 0) > 0)
		.filter(({ visibleObjetivos }) => !hasObjetivoFilter(filtros) || !visibleObjetivos || visibleObjetivos.length > 0)
		.sort((a, b) => byNombre(a.palanca, b.palanca));
	const visiblePalancas = palancaRows.map((row) => row.palanca);
	const objetivosByPalanca = objetivosReady
		? palancaRows.reduce<Record<number, Objetivo[]>>((byPalanca, row) => {
			byPalanca[row.palanca.Id as number] = row.visibleObjetivos ?? [];
			return byPalanca;
		}, {})
		: undefined;
	const otrasVpObjetivos = objetivos.filter((objetivo) => !isVpRrii(objetivo.VP?.Title));
	const vpObjetivos = filterObjetivos(objetivos, 'delVp').filter((objetivo) => isVpRrii(objetivo.VP?.Title));
	const activePalancasCount = state.items.filter((palanca) => palanca.Activa === true).length;
	const summary = Utils.replaceAll(Utils.replaceAll(strings.PalancasSummary,
		'{0}', String(activePalancasCount)),
		'{1}', String(objetivos.length));

	const renderBody = (): React.ReactNode => {
		if (state.isLoading && state.items.length === 0) {
			return <Spinner />;
		}
		if (state.error && lastOperation === 'load') {
			return <MessageBar type="error" message={strings.PalancasLoadError} />;
		}
		if (filtro !== 'todos') {
			if (!objetivosReady) {
				return objetivosError ? null : <Spinner />;
			}
			const objetivosVista = filtro === 'delVp'
				? { items: vpObjetivos, variant: 'delVp' as const, emptyText: strings.ObjetivosVpEmpty }
				: filtro === 'otrasVp'
					? { items: otrasVpObjetivos, variant: 'otrasVp' as const, emptyText: strings.OtherVpObjectivesEmpty }
					: { items: objetivos, variant: 'todos' as const, emptyText: strings.ObjetivosAllEmpty };
			const visibles = byFiltros(bySearch(objetivosVista.items));
			const lastPage = Math.max(FIRST_PAGE, Math.ceil(visibles.length / PAGE_SIZE));
			const page = Math.min(Math.max(FIRST_PAGE, requestedPage), lastPage);
			return (
				<>
					<ObjetivosTable objetivos={visibles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)} iniciativas={iniciativaState.items} resultados={resultadoState.items} variant={objetivosVista.variant} emptyText={objetivosEmptyText(objetivosVista.emptyText)} onView={(id) => navigate(getObjetivoPath(id))} />
					<IniciativasPaginador page={page} pageSize={PAGE_SIZE} total={visibles.length} onPageChange={setPage} />
				</>
			);
		}
		return (
			<PalancasTable
				palancas={visiblePalancas}
				emptyText={hasAnyFilter ? strings.PalancasFiltersEmpty : emptyText}
				canManage={canManage}
				objetivosByPalanca={objetivosByPalanca}
				iniciativas={iniciativaState.items}
				resultados={resultadoState.items}
				onView={(id) => navigate(getPalancaPath(id))}
				onViewObjetivo={(id) => navigate(getObjetivoPath(id))}
				onEdit={(palanca) => setForm({ mode: 'edit', palanca })}
			/>
		);
	};

	return (
		<>
			<SuccessNotice message={successMessage} onClose={closeNotice} />
			<div className={styles.palancas} style={{ gap: spacing.lg, padding: filtro === 'todos' ? spacing.xl : `${spacing.xl} ${spacing.xl} ${PAGER_SPACE}` }}>
				<PalancasHeader
					searchText={searchText}
					onSearchChange={(value) => {
						setSearchText(value);
						setPage(FIRST_PAGE);
					}}
					onBack={() => navigate(HOME_PATH)}
					onRefresh={refresh}
					onOpenFilters={() => setIsFiltersOpen(true)}
					canManage={canManage}
					onNew={() => setForm({ mode: 'new' })}
					canCreateObjetivo={canCreateObjetivo}
					onNewObjetivo={() => setIsObjetivoFormOpen(true)}
				/>
				<p style={SUMMARY_STYLE}>{summary}</p>
				<Tabs
					className={styles.tabs}
					variant="transparent"
					ariaLabel={strings.ObjetivosFilterAriaLabel}
					items={[
						{ key: 'todos', label: `${strings.ObjetivosFilterAll} (${activePalancasCount})` },
						{ key: 'delVp', label: `${strings.ObjetivosFilterVp} (${vpObjetivos.length})` },
						{ key: 'otrasVp', label: `${strings.OtherVpObjectivesSection} (${otrasVpObjetivos.length})` },
						{ key: 'todosObjetivos', label: `${strings.ObjetivosFilterTodos} (${objetivos.length})` }
					]}
					value={filtro}
					onChange={(key) => {
						onFiltroChange(key as ObjetivosFiltro);
						setPage(FIRST_PAGE);
					}}
				/>
				{objetivosError && <MessageBar type="error" message={strings.ObjetivosLoadError} />}
				{renderBody()}
				{isFiltersOpen && (
					<ObjetivosFiltros
						filtros={filtros}
						palancas={state.items.filter((palanca) => palanca.Activa === true)}
						departamentos={names.departamentos}
						gerencias={names.gerencias}
						anios={getAniosObjetivos(objetivos)}
						onApply={applyFiltros}
						onClear={() => applyFiltros(EMPTY_OBJETIVOS_FILTROS)}
						onClose={() => setIsFiltersOpen(false)}
					/>
				)}
				{form?.mode === 'new' && <PalancaForm onSave={createPalanca} onCancel={() => setForm(undefined)} />}
				{form?.mode === 'edit' && <PalancaForm palanca={form.palanca} onSave={updatePalanca} onCancel={() => setForm(undefined)} />}
				{isObjetivoFormOpen && <ObjetivoFormPanel onSaved={onObjetivoCreated} onCancel={() => setIsObjetivoFormOpen(false)} />}
			</div>
		</>
	);
};

export default Palancas;

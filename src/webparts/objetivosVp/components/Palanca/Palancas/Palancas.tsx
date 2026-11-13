import * as React from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import { MessageBar, Spinner, Tabs } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import { Objetivo, Palanca } from '../../../../../core/entities';
import usePalancaDataSource from '../../../../../core/api/Palanca/usePalancaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { getColorStep } from '../../shared/getColorStep';
import { HOME_PATH, getObjetivoPath, getPalancaPath } from '../../ObjetivosVp/routes';
import ObjetivosTable from '../../Objetivo/ObjetivosTable/ObjetivosTable';
import { DEFAULT_PROGRESS, ObjetivosFiltro, filterObjetivos, formatObjetivoId, isVpRrii } from '../../Objetivo/objetivoUtils';
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
	const [state, getItems, addItem, editItem] = usePalancaDataSource();
	const [objetivoState, getObjetivos] = useObjetivoDataSource();
	const names = useObjetivoNames();
	const navigate = useNavigate();
	const [searchText, setSearchText] = React.useState<string>('');
	const [lastOperation, setLastOperation] = React.useState<Operation>('load');
	const [form, setForm] = React.useState<FormState | undefined>(undefined);
	const [isObjetivoFormOpen, setIsObjetivoFormOpen] = React.useState<boolean>(false);
	const [successMessage, setSuccessMessage] = React.useState<string | undefined>(undefined);

	React.useEffect(() => {
		getItems();
		getObjetivos();
	}, []);

	const refresh = (): void => {
		setLastOperation('load');
		getItems();
		getObjetivos();
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
		getObjetivos();
		setSuccessMessage(Utils.replaceAll(strings.ObjetivoCreated, '{0}', objetivo.Nombre ?? ''));
	};

	const search = searchText.trim().toLowerCase();
	const emptyText = search === '' ? strings.PalancasEmpty : strings.PalancasEmptySearch;
	const objetivosEmptyText = (defaultText: string): string => search === '' ? defaultText : strings.ObjetivosEmptySearch;
	const bySearch = (items: Objetivo[]): Objetivo[] => search === '' ? items : items.filter((objetivo) => matchesObjetivo(objetivo, search));

	const objetivosError = objetivoState.error || names.error;
	const objetivosReady = !objetivosError && !objetivoState.isLoading && names.ready;
	const objetivos = objetivosReady ? names.resolve(objetivoState.items) : [];
	const objetivosOfPalanca = (palancaId: number | undefined): Objetivo[] =>
		filterObjetivos(objetivos, filtro).filter((objetivo) => objetivo.Palanca?.Id === palancaId);

	// Como en el prototipo: una palanca se muestra si coincide ella (con todos sus objetivos, salvo que alguno coincida) o alguno de sus objetivos (solo los que coinciden).
	const palancaRows = state.items
		.filter((palanca) => palanca.Activa === true)
		.map((palanca) => {
			const own = objetivosReady ? objetivosOfPalanca(palanca.Id) : undefined;
			const matching = own ? bySearch(own) : [];
			const visibleObjetivos = own && search !== '' && matchesSearch(palanca, search) && matching.length === 0 ? own : matching;
			return { palanca, visibleObjetivos: own ? (search === '' ? own : visibleObjetivos) : undefined };
		})
		.filter(({ palanca, visibleObjetivos }) => search === '' || matchesSearch(palanca, search) || (visibleObjetivos?.length ?? 0) > 0)
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
	const summary = Utils.replaceAll(Utils.replaceAll(Utils.replaceAll(Utils.replaceAll(strings.PalancasSummary,
		'{0}', String(activePalancasCount)),
		'{1}', String(objetivos.length)),
		'{2}', String(new Date().getFullYear())),
		'{3}', `${DEFAULT_PROGRESS} %`);

	const renderBody = (): React.ReactNode => {
		if (state.isLoading && state.items.length === 0) {
			return <Spinner />;
		}
		if (state.error && lastOperation === 'load') {
			return <MessageBar type="error" message={strings.PalancasLoadError} />;
		}
		if (filtro === 'delVp' || filtro === 'otrasVp') {
			if (!objetivosReady) {
				return objetivosError ? null : <Spinner />;
			}
			return filtro === 'delVp'
				? <ObjetivosTable objetivos={bySearch(vpObjetivos)} variant="delVp" emptyText={objetivosEmptyText(strings.ObjetivosVpEmpty)} onView={(id) => navigate(getObjetivoPath(id))} />
				: <ObjetivosTable objetivos={bySearch(otrasVpObjetivos)} variant="otrasVp" emptyText={objetivosEmptyText(strings.OtherVpObjectivesEmpty)} onView={(id) => navigate(getObjetivoPath(id))} />;
		}
		return (
			<PalancasTable
				palancas={visiblePalancas}
				emptyText={emptyText}
				canManage={canManage}
				objetivosByPalanca={objetivosByPalanca}
				onView={(id) => navigate(getPalancaPath(id))}
				onViewObjetivo={(id) => navigate(getObjetivoPath(id))}
				onEdit={(palanca) => setForm({ mode: 'edit', palanca })}
			/>
		);
	};

	return (
		<>
			<SuccessNotice message={successMessage} onClose={closeNotice} />
			<div className={styles.palancas} style={{ gap: spacing.lg, padding: spacing.xl }}>
				<PalancasHeader
					searchText={searchText}
					onSearchChange={setSearchText}
					onBack={() => navigate(HOME_PATH)}
					onRefresh={refresh}
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
						{ key: 'otrasVp', label: `${strings.OtherVpObjectivesSection} (${otrasVpObjetivos.length})` }
					]}
					value={filtro}
					onChange={(key) => onFiltroChange(key as ObjetivosFiltro)}
				/>
				{objetivosError && <MessageBar type="error" message={strings.ObjetivosLoadError} />}
				{renderBody()}
				{form?.mode === 'new' && <PalancaForm onSave={createPalanca} onCancel={() => setForm(undefined)} />}
				{form?.mode === 'edit' && <PalancaForm palanca={form.palanca} onSave={updatePalanca} onCancel={() => setForm(undefined)} />}
				{isObjetivoFormOpen && <ObjetivoFormPanel onSaved={onObjetivoCreated} onCancel={() => setIsObjetivoFormOpen(false)} />}
			</div>
		</>
	);
};

export default Palancas;

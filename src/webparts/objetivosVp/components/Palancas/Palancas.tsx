import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { MessageBar, Spinner, Surface, Tabs, Toast } from '../../../../core/ui/patterns';
import { spacing } from '../../../../core/ui/foundations';
import { Objetivo, Palanca } from '../../../../core/entities';
import usePalancaDataSource from '../../../../core/api/Palanca/usePalancaDataSource';
import useObjetivoDataSource from '../../../../core/api/Objetivo/useObjetivoDataSource';
import { Utils } from '../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { HOME_PATH, getObjetivoNewPath, getObjetivoPath, getPalancaPath } from '../ObjetivosVp/routes';
import ObjetivosTable from '../ObjetivosTable/ObjetivosTable';
import { ObjetivosFiltro, filterObjetivos, isVpRrii } from '../objetivoUtils';
import useObjetivoNames from '../useObjetivoNames';
import PalancaForm from '../PalancaForm/PalancaForm';
import { formatPalancaId } from './formatPalancaId';
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

const TOAST_DURATION_MS = 7000;

const byNombre = (a: Palanca, b: Palanca): number => (a.Nombre ?? '').localeCompare(b.Nombre ?? '', 'es');

const matchesSearch = (palanca: Palanca, search: string): boolean =>
	formatPalancaId(palanca.Id).toLowerCase().indexOf(search) >= 0 ||
	(palanca.Nombre ?? '').toLowerCase().indexOf(search) >= 0;

const Palancas: React.FC<IPalancasProps> = ({ canManage, canCreateObjetivo, filtro, onFiltroChange }) => {
	const [state, getItems, addItem, editItem] = usePalancaDataSource();
	const [objetivoState, getObjetivos] = useObjetivoDataSource();
	const names = useObjetivoNames();
	const navigate = useNavigate();
	const [searchText, setSearchText] = React.useState<string>('');
	const [lastOperation, setLastOperation] = React.useState<Operation>('load');
	const [form, setForm] = React.useState<FormState | undefined>(undefined);
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

	const closeToast = React.useCallback((): void => setSuccessMessage(undefined), []);

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

	const search = searchText.trim().toLowerCase();
	const visiblePalancas = state.items
		.filter((palanca) => palanca.Activa === true)
		.filter((palanca) => search === '' || matchesSearch(palanca, search))
		.sort(byNombre);
	const emptyText = search === '' ? strings.PalancasEmpty : strings.PalancasEmptySearch;

	const objetivosError = objetivoState.error || names.error;
	const objetivosReady = !objetivosError && !objetivoState.isLoading && names.ready;
	const objetivos = objetivosReady ? names.resolve(objetivoState.items) : [];
	const objetivosByPalanca = objetivosReady
		? filterObjetivos(objetivos, filtro).reduce<Record<number, Objetivo[]>>((byPalanca, objetivo) => {
			const palancaId = objetivo.Palanca?.Id;
			if (palancaId !== undefined) {
				byPalanca[palancaId] = (byPalanca[palancaId] ?? []).concat([objetivo]);
			}
			return byPalanca;
		}, {})
		: undefined;
	const otrasVpObjetivos = objetivos.filter((objetivo) => !isVpRrii(objetivo.VP?.Title));

	const renderBody = (): React.ReactNode => {
		if (state.isLoading && state.items.length === 0) {
			return <Spinner />;
		}
		if (state.error && lastOperation === 'load') {
			return <MessageBar type="error" message={strings.PalancasLoadError} />;
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
		<div className={styles.palancas} style={{ gap: spacing.lg, padding: spacing.xl }}>
			<PalancasHeader
				searchText={searchText}
				onSearchChange={setSearchText}
				onBack={() => navigate(HOME_PATH)}
				onRefresh={refresh}
				canManage={canManage}
				onNew={() => setForm({ mode: 'new' })}
				canCreateObjetivo={canCreateObjetivo}
				onNewObjetivo={() => navigate(getObjetivoNewPath())}
			/>
			<Tabs
				variant="filled"
				size="small"
				ariaLabel={strings.ObjetivosFilterAriaLabel}
				items={[
					{ key: 'delVp', label: strings.ObjetivosFilterVp },
					{ key: 'todos', label: strings.ObjetivosFilterAll }
				]}
				value={filtro}
				onChange={(key) => onFiltroChange(key as ObjetivosFiltro)}
			/>
			{objetivosError && <MessageBar type="error" message={strings.ObjetivosLoadError} />}
			{renderBody()}
			{filtro === 'todos' && objetivosReady && (
				<Surface variant="outline" padding="comfortable" header={strings.OtherVpObjectivesSection}>
					<ObjetivosTable
						objetivos={otrasVpObjetivos}
						variant="otrasVp"
						emptyText={strings.OtherVpObjectivesEmpty}
						onView={(id) => navigate(getObjetivoPath(id))}
					/>
				</Surface>
			)}
			{form?.mode === 'new' && <PalancaForm onSave={createPalanca} onCancel={() => setForm(undefined)} />}
			{form?.mode === 'edit' && <PalancaForm palanca={form.palanca} onSave={updatePalanca} onCancel={() => setForm(undefined)} />}
			<Toast
				variant="success"
				open={successMessage !== undefined}
				message={successMessage ?? ''}
				duration={TOAST_DURATION_MS}
				onClose={closeToast}
			/>
		</div>
	);
};

export default Palancas;

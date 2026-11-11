import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { MessageBar, Spinner } from '../../../../core/ui/patterns';
import { spacing } from '../../../../core/ui/foundations';
import { Palanca } from '../../../../core/entities';
import usePalancaDataSource from '../../../../core/api/Palanca/usePalancaDataSource';
import * as strings from 'ObjetivosVpWebPartStrings';
import { HOME_PATH, getPalancaPath } from '../ObjetivosVp/routes';
import { formatPalancaId } from './formatPalancaId';
import PalancasHeader from './PalancasHeader/PalancasHeader';
import PalancasTable from './PalancasTable/PalancasTable';
import styles from './Palancas.module.scss';

export interface IPalancasProps {
	canManage: boolean;
}

type Operation = 'load' | 'save';

const byNombre = (a: Palanca, b: Palanca): number => (a.Nombre ?? '').localeCompare(b.Nombre ?? '', 'es');

const matchesSearch = (palanca: Palanca, search: string): boolean =>
	formatPalancaId(palanca.Id).toLowerCase().indexOf(search) >= 0 ||
	(palanca.Nombre ?? '').toLowerCase().indexOf(search) >= 0;

const Palancas: React.FC<IPalancasProps> = ({ canManage }) => {
	const [state, getItems] = usePalancaDataSource();
	const navigate = useNavigate();
	const [searchText, setSearchText] = React.useState<string>('');
	const [lastOperation, setLastOperation] = React.useState<Operation>('load');

	React.useEffect(() => {
		getItems();
	}, []);

	const refresh = (): void => {
		setLastOperation('load');
		getItems();
	};

	const search = searchText.trim().toLowerCase();
	const visiblePalancas = state.items
		.filter((palanca) => palanca.Activa === true)
		.filter((palanca) => search === '' || matchesSearch(palanca, search))
		.sort(byNombre);
	const emptyText = search === '' ? strings.PalancasEmpty : strings.PalancasEmptySearch;

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
				onView={(id) => navigate(getPalancaPath(id))}
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
			/>
			{renderBody()}
		</div>
	);
};

export default Palancas;

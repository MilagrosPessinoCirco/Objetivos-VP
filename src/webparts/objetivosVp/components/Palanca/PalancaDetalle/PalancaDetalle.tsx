import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../../../../core/ui/components';
import { Chip, MessageBar, Spinner, Surface, Toast } from '../../../../../core/ui/patterns';
import { FigmaIcon, spacing } from '../../../../../core/ui/foundations';
import usePalancaDataSource from '../../../../../core/api/Palanca/usePalancaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import { Palanca } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { PALANCAS_PATH, getObjetivoNewPath, getObjetivoPath } from '../../ObjetivosVp/routes';
import ObjetivosTable from '../../Objetivo/ObjetivosTable/ObjetivosTable';
import { ObjetivosFiltro, filterObjetivos, isNotFoundError } from '../../Objetivo/objetivoUtils';
import useObjetivoNames from '../../Objetivo/useObjetivoNames';
import { formatPalancaId } from '../formatPalancaId';
import { PAGE_TITLE_STYLE } from '../../shared/pageTitleStyle';
import PalancaForm from '../PalancaForm/PalancaForm';
import PalancaBreadcrumb from '../PalancaBreadcrumb/PalancaBreadcrumb';
import PalancaInfo from './PalancaInfo/PalancaInfo';
import styles from './PalancaDetalle.module.scss';

export interface IPalancaDetalleProps {
	canManage: boolean;
	canCreateObjetivo: boolean;
	filtro: ObjetivosFiltro;
}

type LoadError = 'notFound' | 'error';

const TOAST_DURATION_MS = 7000;

const PalancaDetalle: React.FC<IPalancaDetalleProps> = ({ canManage, canCreateObjetivo, filtro }) => {
	const { id } = useParams<{ id: string }>();
	const palancaId = Number(id);
	const isValidId = Number.isInteger(palancaId) && palancaId > 0;
	const navigate = useNavigate();
	const [state, , , editItem, , getById] = usePalancaDataSource();
	const [objetivoState, getObjetivos] = useObjetivoDataSource();
	const names = useObjetivoNames();
	const [loadError, setLoadError] = React.useState<LoadError | undefined>(undefined);
	const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
	const [successMessage, setSuccessMessage] = React.useState<string | undefined>(undefined);
	const closeToast = React.useCallback((): void => setSuccessMessage(undefined), []);

	React.useEffect(() => {
		setLoadError(undefined);
		if (!isValidId) {
			setLoadError('notFound');
			return;
		}
		getObjetivos();
		getById(palancaId).catch((error: unknown) => setLoadError(isNotFoundError(error) ? 'notFound' : 'error'));
	}, [palancaId]);

	const palanca = !loadError && state.item?.Id === palancaId ? state.item : undefined;
	const goPalancas = (): void => navigate(PALANCAS_PATH);

	const updatePalanca = async (edited: Palanca): Promise<void> => {
		await editItem(edited);
		setIsFormOpen(false);
		setSuccessMessage(Utils.replaceAll(strings.PalancaUpdated, '{0}', edited.Nombre ?? ''));
	};

	const renderBody = (): React.ReactNode => {
		if (loadError === 'notFound') {
			return <MessageBar type="error" message={strings.PalancaNotFound} />;
		}
		if (loadError === 'error') {
			return <MessageBar type="error" message={strings.PalancaLoadError} />;
		}
		if (!palanca) {
			return state.isLoading ? <Spinner /> : null;
		}
		return (
			<>
				<PalancaInfo palanca={palanca} />
				<Surface variant="outline" padding="comfortable" header={strings.PalancaObjectivesSection}>
					{objetivoState.error || names.error ? (
						<MessageBar type="error" message={strings.ObjetivosLoadError} />
					) : (
						<ObjetivosTable
							objetivos={filterObjetivos(names.resolve(objetivoState.items), filtro).filter((objetivo) => objetivo.Palanca?.Id === palancaId)}
							variant="palanca"
							emptyText={strings.PalancaObjectivesEmpty}
							onView={(objetivoId) => navigate(getObjetivoPath(objetivoId))}
						/>
					)}
				</Surface>
			</>
		);
	};

	return (
		<div className={styles.detalle} style={{ gap: spacing.lg, padding: spacing.xl }}>
			<PalancaBreadcrumb palancaNombre={palanca?.Nombre} />
			<div className={styles.header} style={{ gap: spacing.md }}>
				<Button variant="secondary" size="small" iconLeft={<FigmaIcon name="arrowCircle" />} onClick={goPalancas}>
					{strings.Back}
				</Button>
				{palanca && (
					<>
						<h1 style={PAGE_TITLE_STYLE}>
							{Utils.replaceAll(Utils.replaceAll(strings.PalancaDetailTitle, '{0}', formatPalancaId(palanca.Id)), '{1}', palanca.Nombre ?? '')}
						</h1>
						<Chip
							size="small"
							clickable={false}
							color={palanca.Activa ? 'success' : 'neutral'}
							label={palanca.Activa ? strings.PalancaActiveChip : strings.PalancaInactiveChip}
						/>
					</>
				)}
			</div>
			{renderBody()}
			<div className={styles.footer} style={{ gap: spacing.lg }}>
				<Button variant="secondary" onClick={goPalancas}>
					{strings.Cancel}
				</Button>
				{canCreateObjetivo && palanca && (
					<Button variant="primary" iconLeft={<FigmaIcon name="add" />} onClick={() => navigate(getObjetivoNewPath(palancaId))}>
						{strings.ObjetivoNew}
					</Button>
				)}
				{canManage && palanca && (
					<Button variant="primary" onClick={() => setIsFormOpen(true)}>
						{strings.Edit}
					</Button>
				)}
			</div>
			{isFormOpen && palanca && (
				<PalancaForm palanca={palanca} onSave={updatePalanca} onCancel={() => setIsFormOpen(false)} />
			)}
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

export default PalancaDetalle;

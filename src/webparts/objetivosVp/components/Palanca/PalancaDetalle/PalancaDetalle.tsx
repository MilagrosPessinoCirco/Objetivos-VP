import * as React from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Tooltip } from '../../../../../core/ui/components';
import { MessageBar, Spinner, Toast } from '../../../../../core/ui/patterns';
import { FigmaIcon, spacing } from '../../../../../core/ui/foundations';
import usePalancaDataSource from '../../../../../core/api/Palanca/usePalancaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import { Objetivo, Palanca } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { PALANCAS_PATH, getObjetivoPath } from '../../ObjetivosVp/routes';
import ObjetivoFormPanel from '../../Objetivo/ObjetivoForm/ObjetivoFormPanel';
import ObjetivosTable from '../../Objetivo/ObjetivosTable/ObjetivosTable';
import { ObjetivosFiltro, filterObjetivos, isNotFoundError } from '../../Objetivo/objetivoUtils';
import useObjetivoNames from '../../Objetivo/useObjetivoNames';
import { formatPalancaId } from '../formatPalancaId';
import BackButton from '../../shared/BackButton/BackButton';
import DetailFooter from '../../shared/DetailFooter/DetailFooter';
import HeaderChip from '../../shared/HeaderChip/HeaderChip';
import LocationButton from '../../shared/LocationButton/LocationButton';
import SectionBand from '../../shared/SectionBand/SectionBand';
import { getColorStep } from '../../shared/getColorStep';
import { HEADER_TITLE_STYLE } from '../../shared/pageTitleStyle';
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

const ACTIVE_CHIP_TEXT_COLOR = getColorStep('Green', '800').value;

const ADD_BUTTON_STYLE: CSSProperties = {
	width: 22,
	minWidth: 22,
	height: 22,
	minHeight: 22,
	padding: 0,
	borderRadius: '50%',
	backgroundColor: getColorStep('Primary', '500').value,
	borderColor: getColorStep('Primary', '500').value
};

const PAGE_PADDING = `${spacing.xl} ${spacing.xl} 96px`;

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
	const [isObjetivoFormOpen, setIsObjetivoFormOpen] = React.useState<boolean>(false);
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

	const onObjetivoCreated = (objetivo: Objetivo): void => {
		setIsObjetivoFormOpen(false);
		getObjetivos();
		setSuccessMessage(Utils.replaceAll(strings.ObjetivoCreated, '{0}', objetivo.Nombre ?? ''));
	};

	const palancaObjetivos = filterObjetivos(names.resolve(objetivoState.items), filtro).filter((objetivo) => objetivo.Palanca?.Id === palancaId);

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
				<SectionBand
					title={`${strings.PalancaObjectivesSection} (${palancaObjetivos.length})`}
					action={canCreateObjetivo && (
						<Tooltip content={strings.ObjetivoNew}>
							<Button
								iconOnly
								circular
								variant="primary"
								style={ADD_BUTTON_STYLE}
								iconLeft={<FigmaIcon name="add" size="sm" className={styles.boldWhiteIcon} />}
								aria-label={strings.ObjetivoNew}
								onClick={() => setIsObjetivoFormOpen(true)}
							/>
						</Tooltip>
					)}
				>
					{objetivoState.error || names.error ? (
						<MessageBar type="error" message={strings.ObjetivosLoadError} />
					) : (
						<ObjetivosTable
							objetivos={palancaObjetivos}
							variant="palanca"
							emptyText={strings.PalancaObjectivesEmpty}
							onView={(objetivoId) => navigate(getObjetivoPath(objetivoId))}
						/>
					)}
				</SectionBand>
			</>
		);
	};

	return (
		<div className={styles.detalle} style={{ gap: spacing.lg, padding: PAGE_PADDING }}>
			<PalancaBreadcrumb palancaNombre={palanca?.Nombre} />
			<div className={styles.header} style={{ gap: spacing.md }}>
				<BackButton onClick={goPalancas} />
				{palanca && (
					<>
						<h1 style={HEADER_TITLE_STYLE}>
							{Utils.replaceAll(Utils.replaceAll(strings.PalancaDetailTitle, '{0}', formatPalancaId(palanca.Id)), '{1}', palanca.Nombre ?? '')}
						</h1>
						<HeaderChip
							color={palanca.Activa ? 'success' : 'neutral'}
							textColor={palanca.Activa ? ACTIVE_CHIP_TEXT_COLOR : undefined}
							label={palanca.Activa ? strings.PalancaActiveChip : strings.PalancaInactiveChip}
						/>
						<LocationButton />
					</>
				)}
			</div>
			{renderBody()}
			<DetailFooter>
				<Button variant="secondary" onClick={goPalancas}>
					{strings.Cancel}
				</Button>
				{canManage && palanca && (
					<Button variant="primary" onClick={() => setIsFormOpen(true)}>
						{strings.Edit}
					</Button>
				)}
			</DetailFooter>
			{isFormOpen && palanca && (
				<PalancaForm palanca={palanca} onSave={updatePalanca} onCancel={() => setIsFormOpen(false)} />
			)}
			{isObjetivoFormOpen && <ObjetivoFormPanel initialPalancaId={palancaId} onCreated={onObjetivoCreated} onCancel={() => setIsObjetivoFormOpen(false)} />}
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

import * as React from 'react';
import type { CSSProperties } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../../../../core/ui/components';
import { MessageBar, Spinner } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import useIniciativaDataSource from '../../../../../core/api/Iniciativa/useIniciativaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import useResultadoClaveDataSource from '../../../../../core/api/ResultadoClave/useResultadoClaveDataSource';
import { Iniciativa, Objetivo } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { PALANCAS_PATH, getFrom } from '../../ObjetivosVp/routes';
import BackButton from '../../shared/BackButton/BackButton';
import DetailFooter from '../../shared/DetailFooter/DetailFooter';
import HeaderChip from '../../shared/HeaderChip/HeaderChip';
import UbicacionEstrategia from '../../shared/UbicacionEstrategia/UbicacionEstrategia';
import SuccessNotice from '../../shared/SuccessNotice/SuccessNotice';
import AvanceText from '../../shared/AvanceText/AvanceText';
import { HEADER_TITLE_STYLE } from '../../shared/pageTitleStyle';
import PalancaBreadcrumb from '../../Palanca/PalancaBreadcrumb/PalancaBreadcrumb';
import { getAvanceObjetivo } from '../../Iniciativa/resultadoClaveUtils';
import { formatObjetivoId, getEstadoChipColor, isNotFoundError, isVpRrii } from '../objetivoUtils';
import useObjetivoNames from '../useObjetivoNames';
import ObjetivoFormPanel from '../ObjetivoForm/ObjetivoFormPanel';
import ObjetivoIniciativas from './ObjetivoIniciativas/ObjetivoIniciativas';
import ObjetivoInfo from './ObjetivoInfo/ObjetivoInfo';
import styles from './ObjetivoDetalle.module.scss';

export interface IObjetivoDetalleProps {
	canEditObjetivo: boolean;
	canCreateIniciativa: boolean;
	canLoadResultadosClave: boolean;
	canViewPesos?: boolean;
}

type LoadError = 'notFound' | 'error';

const PAGE_PADDING = `${spacing.xl} ${spacing.xl} 96px`;

const PROGRESS_LABEL_STYLE: CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[14],
	lineHeight: typography.lineHeight[14]
};

const ObjetivoDetalle: React.FC<IObjetivoDetalleProps> = ({ canEditObjetivo, canCreateIniciativa, canLoadResultadosClave, canViewPesos }) => {
	const { id } = useParams<{ id: string }>();
	const objetivoId = Number(id);
	const isValidId = Number.isInteger(objetivoId) && objetivoId > 0;
	const navigate = useNavigate();
	const location = useLocation();
	const [state, , , , , getById] = useObjetivoDataSource();
	const names = useObjetivoNames();
	const [iniciativaState, getIniciativas] = useIniciativaDataSource();
	const [resultadoState, getResultados] = useResultadoClaveDataSource();
	const [ready, setReady] = React.useState<boolean>(false);
	const [loadError, setLoadError] = React.useState<LoadError | undefined>(undefined);
	const [noticeMessage, setNoticeMessage] = React.useState<string | undefined>(undefined);
	const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
	const closeNotice = React.useCallback((): void => setNoticeMessage(undefined), []);

	React.useEffect(() => {
		setLoadError(undefined);
		if (!isValidId) {
			setLoadError('notFound');
			return;
		}
		getById(objetivoId).catch((error: unknown) => setLoadError(isNotFoundError(error) ? 'notFound' : 'error'));
		Promise.all([getIniciativas(), getResultados()]).then(() => setReady(true));
	}, [objetivoId]);

	const dataError = iniciativaState.error || resultadoState.error;

	const reloadIniciativas = (): void => {
		getIniciativas();
		getResultados();
	};

	const loaded = !loadError && state.item?.Id === objetivoId && names.ready ? state.item : undefined;
	const objetivo = loaded ? names.resolve([loaded])[0] : undefined;
	const goBack = (): void => navigate(getFrom(location.state) ?? PALANCAS_PATH);

	const onSaved = (saved: Objetivo): void => {
		setIsFormOpen(false);
		setNoticeMessage(Utils.replaceAll(strings.ObjetivoUpdated, '{0}', saved.Nombre ?? ''));
		getById(objetivoId).catch((error: unknown) => setLoadError(isNotFoundError(error) ? 'notFound' : 'error'));
	};

	const onIniciativaCreated = (iniciativa: Iniciativa): void => {
		setNoticeMessage(Utils.replaceAll(strings.IniciativaCreated, '{0}', iniciativa.Nombre ?? ''));
	};

	const renderBody = (): React.ReactNode => {
		if (loadError === 'notFound') {
			return <MessageBar type="error" message={strings.ObjetivoNotFound} />;
		}
		if (loadError === 'error' || names.error) {
			return <MessageBar type="error" message={strings.ObjetivoLoadError} />;
		}
		if (!objetivo) {
			return state.isLoading ? <Spinner /> : null;
		}
		return (
			<>
				<ObjetivoInfo objetivo={objetivo} onEdit={canEditObjetivo ? () => setIsFormOpen(true) : undefined} />
				<ObjetivoIniciativas
					objetivo={objetivo}
					iniciativas={iniciativaState.items}
					resultados={resultadoState.items}
					ready={ready}
					error={dataError}
					canCreate={canCreateIniciativa}
					canLoadResultadosClave={canLoadResultadosClave}
					canViewPesos={canViewPesos}
					onCreated={onIniciativaCreated}
					onReload={reloadIniciativas}
				/>
			</>
		);
	};

	return (
		<>
			<SuccessNotice message={noticeMessage} onClose={closeNotice} />
			<div className={styles.detalle} style={{ gap: spacing.lg, padding: PAGE_PADDING }}>
				<PalancaBreadcrumb
					palancaNombre={objetivo?.Palanca?.Title}
					palancaId={objetivo?.Palanca?.Id}
					objetivoNombre={objetivo?.Nombre}
				/>
				<div className={styles.header} style={{ gap: spacing.md }}>
					<BackButton onClick={goBack} />
					{objetivo && (
						<>
							<h1 style={HEADER_TITLE_STYLE}>
								{Utils.replaceAll(Utils.replaceAll(strings.ObjetivoDetailTitle, '{0}', formatObjetivoId(objetivo.Id)), '{1}', objetivo.Nombre ?? '')}
							</h1>
							<HeaderChip color={getEstadoChipColor(objetivo.Estado)} label={objetivo.Estado ?? ''} />
							<div className={styles.headerEnd} style={{ gap: spacing.md }}>
								{isVpRrii(objetivo.VP?.Title) && ready && !dataError && (
									<span style={PROGRESS_LABEL_STYLE}>
										{strings.ObjetivoDetailProgress}{' '}
										<AvanceText value={getAvanceObjetivo(objetivo.Id, iniciativaState.items, resultadoState.items)} spaced />
									</span>
								)}
								<UbicacionEstrategia tipo="objetivo" id={objetivoId} otraVp={isVpRrii(objetivo.VP?.Title) ? undefined : objetivo.VP?.Title} />
							</div>
						</>
					)}
				</div>
				{renderBody()}
				<DetailFooter>
					<Button variant="secondary" onClick={goBack}>
						{strings.Cancel}
					</Button>
					{canEditObjetivo && objetivo && (
						<Button variant="primary" onClick={() => setIsFormOpen(true)}>
							{strings.Edit}
						</Button>
					)}
				</DetailFooter>
				{isFormOpen && objetivo && <ObjetivoFormPanel objetivo={loaded} onSaved={onSaved} onCancel={() => setIsFormOpen(false)} />}
			</div>
		</>
	);
};

export default ObjetivoDetalle;

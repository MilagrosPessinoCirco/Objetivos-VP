import * as React from 'react';
import type { CSSProperties } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../../../../core/ui/components';
import { MessageBar, Spinner } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import useAreaDataSource from '../../../../../core/api/Area/useAreaDataSource';
import useIniciativaDataSource from '../../../../../core/api/Iniciativa/useIniciativaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import useTareaDataSource from '../../../../../core/api/Tarea/useTareaDataSource';
import * as strings from 'ObjetivosVpWebPartStrings';
import { TAREAS_PATH, getIniciativaPath } from '../../ObjetivosVp/routes';
import AvanceText from '../../shared/AvanceText/AvanceText';
import BackButton from '../../shared/BackButton/BackButton';
import DetailFooter from '../../shared/DetailFooter/DetailFooter';
import HeaderChip from '../../shared/HeaderChip/HeaderChip';
import { HEADER_TITLE_STYLE } from '../../shared/pageTitleStyle';
import PalancaBreadcrumb from '../../Palanca/PalancaBreadcrumb/PalancaBreadcrumb';
import { isNotFoundError, isVpRrii } from '../../Objetivo/objetivoUtils';
import useObjetivoNames from '../../Objetivo/useObjetivoNames';
import { formatIdNombre, formatIniciativaId, formatObjetivoLabel } from '../../Iniciativa/iniciativaUtils';
import TareaHistorialPanel from '../TareaHistorialPanel/TareaHistorialPanel';
import { formatTareaId, getEstadoTareaChipColor } from '../tareaUtils';
import TareaComentario from './TareaComentario/TareaComentario';
import TareaInfo from './TareaInfo/TareaInfo';
import styles from './TareaDetalle.module.scss';

type LoadError = 'notFound' | 'error';

const PAGE_PADDING = `${spacing.xl} ${spacing.xl} 96px`;
const NAME_SEPARATOR = ', ';

const PROGRESS_LABEL_STYLE: CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[14],
	lineHeight: typography.lineHeight[14]
};

const getFrom = (state: unknown): string | undefined => {
	const from = typeof state === 'object' && state !== null && 'from' in state ? (state as { from: unknown }).from : undefined;
	return typeof from === 'string' ? from : undefined;
};

const TareaDetalle: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const tareaId = Number(id);
	const isValidId = Number.isInteger(tareaId) && tareaId > 0;
	const navigate = useNavigate();
	const location = useLocation();
	const [tareaState, , , , , getTarea] = useTareaDataSource();
	const [iniciativaState, , , , , getIniciativa] = useIniciativaDataSource();
	const [objetivoState, , , , , getObjetivo] = useObjetivoDataSource();
	const [areaState, getAreas] = useAreaDataSource();
	const names = useObjetivoNames();
	const [loadError, setLoadError] = React.useState<LoadError | undefined>(undefined);
	const [attempt, setAttempt] = React.useState<number>(0);
	const [isHistoryOpen, setIsHistoryOpen] = React.useState<boolean>(false);

	const tarea = tareaState.item?.Id === tareaId ? tareaState.item : undefined;
	const iniciativaId = tarea?.Iniciativa?.Id;
	const iniciativa = iniciativaState.item?.Id === iniciativaId ? iniciativaState.item : undefined;
	const objetivoId = iniciativa?.Objetivo?.Id;
	const objetivoLoaded = objetivoState.item?.Id === objetivoId ? objetivoState.item : undefined;
	const objetivo = objetivoLoaded && names.ready ? names.resolve([objetivoLoaded])[0] : undefined;

	React.useEffect(() => {
		setLoadError(undefined);
		if (!isValidId) {
			setLoadError('notFound');
			return;
		}
		getTarea(tareaId).catch((error: unknown) => setLoadError(isNotFoundError(error) ? 'notFound' : 'error'));
		getAreas();
	}, [tareaId, attempt]);

	React.useEffect(() => {
		if (iniciativaId === undefined) {
			return;
		}
		getIniciativa(iniciativaId).catch(() => setLoadError('error'));
	}, [iniciativaId, attempt]);

	React.useEffect(() => {
		if (objetivoId === undefined) {
			return;
		}
		getObjetivo(objetivoId).catch(() => setLoadError('error'));
	}, [objetivoId, attempt]);

	const isRrii = isVpRrii(objetivo?.VP?.Title);
	const hasError = loadError === 'error' || names.error || areaState.error;
	const loaded = !loadError && !hasError && tarea !== undefined && iniciativa !== undefined && objetivo !== undefined;
	const areaNames = (tarea?.Area ?? [])
		.map((area) => areaState.items.filter((item) => item.Id === area.Id)[0]?.Nombre ?? area.Title)
		.join(NAME_SEPARATOR);

	const goBack = (): void => {
		const from = getFrom(location.state);
		if (from) {
			navigate(from);
		}
		else if (tarea?.Iniciativa) {
			navigate(getIniciativaPath(tarea.Iniciativa.Id));
		}
		else {
			navigate(TAREAS_PATH);
		}
	};

	const renderBody = (): React.ReactNode => {
		if (loadError === 'notFound') {
			return <MessageBar type="error" message={strings.TareaNotFound} />;
		}
		if (hasError) {
			return (
				<MessageBar
					type="error"
					message={strings.TareaLoadError}
					actions={<Button variant="secondary" onClick={() => setAttempt(attempt + 1)}>{strings.TareasRetry}</Button>}
				/>
			);
		}
		if (!loaded || !tarea || !iniciativa || !objetivo) {
			return <Spinner />;
		}
		return (
			<>
				<TareaInfo
					tarea={tarea}
					iniciativaText={formatIdNombre(formatIniciativaId(iniciativa.Id), iniciativa.Nombre)}
					objetivoText={formatObjetivoLabel(objetivo)}
					areaNames={areaNames}
				/>
				<TareaComentario tarea={tarea} />
			</>
		);
	};

	return (
		<div className={styles.detalle} style={{ gap: spacing.lg, padding: PAGE_PADDING }}>
			<PalancaBreadcrumb
				palancaNombre={isRrii ? objetivo?.Palanca?.Title : undefined}
				palancaId={isRrii ? objetivo?.Palanca?.Id : undefined}
				objetivoNombre={objetivo?.Nombre}
				objetivoId={objetivo?.Id}
				iniciativaNombre={iniciativa?.Nombre}
				iniciativaId={iniciativa?.Id}
				tareaNombre={tarea?.Nombre}
			/>
			<div className={styles.header} style={{ gap: spacing.md }}>
				<BackButton onClick={goBack} />
				{loaded && tarea && (
					<>
						<h1 style={HEADER_TITLE_STYLE}>{formatIdNombre(formatTareaId(tarea.Id), tarea.Nombre)}</h1>
						<HeaderChip color={getEstadoTareaChipColor(tarea.Estado)} label={tarea.Estado ?? ''} />
						<div className={styles.headerEnd} style={{ gap: spacing.md }}>
							<span style={PROGRESS_LABEL_STYLE}>
								{strings.ObjetivoDetailProgress} <AvanceText value={tarea.Avance ?? 0} spaced />
							</span>
						</div>
					</>
				)}
			</div>
			{renderBody()}
			<DetailFooter>
				<Button variant="secondary" onClick={goBack}>
					{strings.Cancel}
				</Button>
				{loaded && tarea && (
					<Button variant="secondary" onClick={() => setIsHistoryOpen(true)}>
						{strings.TareaHistory}
					</Button>
				)}
			</DetailFooter>
			{isHistoryOpen && tarea && <TareaHistorialPanel tarea={tarea} onClose={() => setIsHistoryOpen(false)} />}
		</div>
	);
};

export default TareaDetalle;

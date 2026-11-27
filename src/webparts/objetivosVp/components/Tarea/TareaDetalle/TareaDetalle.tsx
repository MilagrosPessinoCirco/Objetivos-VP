import * as React from 'react';
import type { CSSProperties } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../../../../core/ui/components';
import { MessageBar, Spinner } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import useAreaDataSource from '../../../../../core/api/Area/useAreaDataSource';
import useIniciativaDataSource from '../../../../../core/api/Iniciativa/useIniciativaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import { canCargarRiesgo } from '../../../../../core/api/Riesgo/riesgoReglas';
import type { IRiesgoConDecision } from '../../../../../core/api/Riesgo/IRiesgoService';
import useRiesgosTarea from '../../../../../core/api/Riesgo/useRiesgosTarea';
import useTareaDataSource from '../../../../../core/api/Tarea/useTareaDataSource';
import { Tarea } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import type { IPersonValue } from '../../../../../core/utils/Mappers';
import * as strings from 'ObjetivosVpWebPartStrings';
import { TAREAS_PATH, getIniciativaPath } from '../../ObjetivosVp/routes';
import AvanceText from '../../shared/AvanceText/AvanceText';
import BackButton from '../../shared/BackButton/BackButton';
import DetailFooter from '../../shared/DetailFooter/DetailFooter';
import HeaderChip from '../../shared/HeaderChip/HeaderChip';
import SuccessNotice from '../../shared/SuccessNotice/SuccessNotice';
import UbicacionEstrategia from '../../shared/UbicacionEstrategia/UbicacionEstrategia';
import { HEADER_TITLE_STYLE } from '../../shared/pageTitleStyle';
import PalancaBreadcrumb from '../../Palanca/PalancaBreadcrumb/PalancaBreadcrumb';
import { isNotFoundError, isVpRrii } from '../../Objetivo/objetivoUtils';
import useObjetivoNames from '../../Objetivo/useObjetivoNames';
import { formatIdNombre, formatIniciativaId, formatObjetivoLabel } from '../../Iniciativa/iniciativaUtils';
import RiesgoFormPanel from '../../Riesgo/RiesgoForm/RiesgoFormPanel';
import TareaFormPanel from '../TareaForm/TareaFormPanel';
import TareaAvancePanel from '../TareaAvancePanel/TareaAvancePanel';
import TareaHistorialPanel from '../TareaHistorialPanel/TareaHistorialPanel';
import { canEditTarea, canRegistrarAvance, formatTareaId, getEstadoTareaChipColor } from '../tareaUtils';
import TareaComentario from './TareaComentario/TareaComentario';
import TareaInfo from './TareaInfo/TareaInfo';
import TareaRiesgos from './TareaRiesgos/TareaRiesgos';
import styles from './TareaDetalle.module.scss';

export interface ITareaDetalleProps {
	canEdit: (responsable?: IPersonValue, accountable?: IPersonValue) => boolean;
	canRegisterProgress: (responsable?: IPersonValue, accountable?: IPersonValue) => boolean;
	canCreateRiesgo: (responsable?: IPersonValue, accountable?: IPersonValue) => boolean;
	canEditRiesgo: (responsable?: IPersonValue, accountable?: IPersonValue) => boolean;
}

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

const TareaDetalle: React.FC<ITareaDetalleProps> = ({ canEdit, canRegisterProgress, canCreateRiesgo, canEditRiesgo }) => {
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
	const riesgos = useRiesgosTarea(isValidId ? tareaId : undefined);
	const [loadError, setLoadError] = React.useState<LoadError | undefined>(undefined);
	const [attempt, setAttempt] = React.useState<number>(0);
	const [isHistoryOpen, setIsHistoryOpen] = React.useState<boolean>(false);
	const [isAvanceOpen, setIsAvanceOpen] = React.useState<boolean>(false);
	const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
	const [isRiesgoOpen, setIsRiesgoOpen] = React.useState<boolean>(false);
	const [riesgoEnEdicion, setRiesgoEnEdicion] = React.useState<IRiesgoConDecision | undefined>(undefined);
	const [noticeMessage, setNoticeMessage] = React.useState<string | undefined>(undefined);
	const closeNotice = React.useCallback((): void => setNoticeMessage(undefined), []);

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

	const canRegister = canRegisterProgress(tarea?.Responsable, iniciativa?.Accountable) && tarea !== undefined && canRegistrarAvance(tarea);
	const canEditar = canEdit(tarea?.Responsable, iniciativa?.Accountable) && tarea !== undefined && canEditTarea(tarea);
	const canCargar = canCreateRiesgo(tarea?.Responsable, iniciativa?.Accountable) && tarea !== undefined && iniciativa !== undefined && canCargarRiesgo(tarea, iniciativa);
	const canEditarRiesgo = canEditRiesgo(tarea?.Responsable, iniciativa?.Accountable);

	const onEdited = (saved: Tarea): void => {
		setIsFormOpen(false);
		getTarea(tareaId).catch(() => setLoadError('error'));
		setNoticeMessage(Utils.replaceAll(strings.TareaUpdated, '{0}', saved.Nombre ?? ''));
	};

	const onAvanceSaved = (): void => {
		setIsAvanceOpen(false);
		getTarea(tareaId).catch(() => setLoadError('error'));
		setNoticeMessage(Utils.replaceAll(strings.TareaProgressUpdated, '{0}', tarea?.Nombre ?? ''));
	};

	const closeRiesgoPanel = (): void => {
		setIsRiesgoOpen(false);
		setRiesgoEnEdicion(undefined);
	};

	const onRiesgoSaved = (escalado: boolean, descripcion: string): void => {
		const message = riesgoEnEdicion ? (escalado ? strings.RiesgoEscalated : strings.RiesgoUpdated) : strings.RiesgoCreated;
		closeRiesgoPanel();
		riesgos.reload();
		setNoticeMessage(Utils.replaceAll(message, '{0}', descripcion));
	};

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
					onEdit={canEditar ? () => setIsFormOpen(true) : undefined}
				/>
				<TareaComentario tarea={tarea} onEdit={canRegister ? () => setIsAvanceOpen(true) : undefined} />
				<TareaRiesgos
					items={riesgos.items}
					isLoading={riesgos.isLoading}
					error={riesgos.error}
					onRetry={() => { riesgos.reload(); }}
					tarea={tarea}
					canEdit={canEditarRiesgo}
					onEdit={setRiesgoEnEdicion}
				/>
			</>
		);
	};

	return (
		<>
			<SuccessNotice message={noticeMessage} onClose={closeNotice} />
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
								<UbicacionEstrategia tipo="tarea" id={tareaId} otraVp={isRrii ? undefined : objetivo?.VP?.Title} />
							</div>
						</>
					)}
				</div>
				{renderBody()}
				<DetailFooter>
					<Button variant="secondary" onClick={goBack}>
						{strings.Cancel}
					</Button>
					{loaded && canEditar && (
						<Button variant="primary" onClick={() => setIsFormOpen(true)}>
							{strings.Edit}
						</Button>
					)}
					{loaded && canRegister && (
						<Button variant="primary" onClick={() => setIsAvanceOpen(true)}>
							{strings.TareaRegisterProgress}
						</Button>
					)}
					{loaded && canCargar && (
						<Button variant="secondary" onClick={() => setIsRiesgoOpen(true)}>
							{strings.RiesgoNew}
						</Button>
					)}
					{loaded && tarea && (
						<Button variant="secondary" onClick={() => setIsHistoryOpen(true)}>
							{strings.TareaHistory}
						</Button>
					)}
				</DetailFooter>
				{isFormOpen && tarea && <TareaFormPanel tarea={tarea} accountable={iniciativa?.Accountable} onSaved={onEdited} onCancel={() => setIsFormOpen(false)} />}
				{isAvanceOpen && tarea && <TareaAvancePanel tarea={tarea} accountable={iniciativa?.Accountable} onSaved={onAvanceSaved} onCancel={() => setIsAvanceOpen(false)} />}
				{(isRiesgoOpen || riesgoEnEdicion !== undefined) && tarea && (
					<RiesgoFormPanel tarea={tarea} item={riesgoEnEdicion} onSaved={onRiesgoSaved} onCancel={closeRiesgoPanel} />
				)}
				{isHistoryOpen && tarea && <TareaHistorialPanel tarea={tarea} onClose={() => setIsHistoryOpen(false)} />}
			</div>
		</>
	);
};

export default TareaDetalle;

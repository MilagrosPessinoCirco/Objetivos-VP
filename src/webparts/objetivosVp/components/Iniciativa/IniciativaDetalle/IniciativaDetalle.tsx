import * as React from 'react';
import type { CSSProperties } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../../../../core/ui/components';
import { MessageBar, Spinner } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import useAreaDataSource from '../../../../../core/api/Area/useAreaDataSource';
import useComentariosIniciativa from '../../../../../core/api/ComentarioIniciativa/useComentariosIniciativa';
import useIniciativaDataSource from '../../../../../core/api/Iniciativa/useIniciativaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import useResultadoClaveDataSource from '../../../../../core/api/ResultadoClave/useResultadoClaveDataSource';
import useTareasIniciativa from '../../../../../core/api/Tarea/useTareasIniciativa';
import { Iniciativa, ResultadoClave, Tarea } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import type { IPersonValue } from '../../../../../core/utils/Mappers';
import * as strings from 'ObjetivosVpWebPartStrings';
import { INICIATIVAS_PATH, getObjetivoPath, getTareaPath } from '../../ObjetivosVp/routes';
import BackButton from '../../shared/BackButton/BackButton';
import DetailFooter from '../../shared/DetailFooter/DetailFooter';
import HeaderChip from '../../shared/HeaderChip/HeaderChip';
import SuccessNotice from '../../shared/SuccessNotice/SuccessNotice';
import AvanceText from '../../shared/AvanceText/AvanceText';
import { getColorStep } from '../../shared/getColorStep';
import { HEADER_TITLE_STYLE } from '../../shared/pageTitleStyle';
import PalancaBreadcrumb from '../../Palanca/PalancaBreadcrumb/PalancaBreadcrumb';
import TareaFormPanel from '../../Tarea/TareaForm/TareaFormPanel';
import { canCargarTarea } from '../../Tarea/tareaUtils';
import { isVpRrii } from '../../Objetivo/objetivoUtils';
import useObjetivoNames from '../../Objetivo/useObjetivoNames';
import IniciativaEstadoPanel from '../IniciativaEstadoPanel/IniciativaEstadoPanel';
import IniciativaFormPanel from '../IniciativaForm/IniciativaFormPanel';
import ResultadoClaveSeguimientoPanel from '../ResultadoClaveSeguimientoPanel/ResultadoClaveSeguimientoPanel';
import { formatIdNombre, formatIniciativaId, getEstadoIniciativaChipColor, getPesosIniciativa, getUltimoComentario } from '../iniciativaUtils';
import { getAvanceIniciativa } from '../resultadoClaveUtils';
import IniciativaComentario from './IniciativaComentario/IniciativaComentario';
import IniciativaInfo from './IniciativaInfo/IniciativaInfo';
import IniciativaResultadosClave from './IniciativaResultadosClave/IniciativaResultadosClave';
import IniciativaTareas from './IniciativaTareas/IniciativaTareas';
import IniciativaTareasIndicadores from './IniciativaTareasIndicadores/IniciativaTareasIndicadores';
import styles from './IniciativaDetalle.module.scss';

export interface IIniciativaDetalleProps {
	canEdit: (accountable?: IPersonValue) => boolean;
	canChangeEstado: (accountable?: IPersonValue) => boolean;
	canLoadResultadosClave: boolean;
	canTrackResultadoClave: (accountable?: IPersonValue) => boolean;
	canCreateTarea: boolean;
	canViewPesos?: boolean;
}

const PAGE_PADDING = `${spacing.xl} ${spacing.xl} 96px`;
const NAME_SEPARATOR = ', ';

const CHANGE_STATUS_COLOR = getColorStep('Secondary', '700').value;
const CHANGE_STATUS_STYLE: CSSProperties = { backgroundColor: CHANGE_STATUS_COLOR, borderColor: CHANGE_STATUS_COLOR };
const NEW_TAREA_COLOR = getColorStep('Tertiary', '900').value;
const NEW_TAREA_STYLE: CSSProperties = { fontWeight: typography.weight.bold, backgroundColor: NEW_TAREA_COLOR, borderColor: NEW_TAREA_COLOR };
const PROGRESS_LABEL_STYLE: CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[14],
	lineHeight: typography.lineHeight[14]
};

const getFrom = (state: unknown): string | undefined => {
	const from = typeof state === 'object' && state !== null && 'from' in state ? (state as { from: unknown }).from : undefined;
	return typeof from === 'string' ? from : undefined;
};

const IniciativaDetalle: React.FC<IIniciativaDetalleProps> = ({ canEdit, canChangeEstado, canLoadResultadosClave, canTrackResultadoClave, canCreateTarea, canViewPesos }) => {
	const { id } = useParams<{ id: string }>();
	const iniciativaId = Number(id);
	const isValidId = Number.isInteger(iniciativaId) && iniciativaId > 0;
	const navigate = useNavigate();
	const location = useLocation();
	const [iniciativaState, getIniciativas] = useIniciativaDataSource();
	const [objetivoState, getObjetivos] = useObjetivoDataSource();
	const [areaState, getAreas] = useAreaDataSource();
	const [resultadoState, getResultados] = useResultadoClaveDataSource();
	const names = useObjetivoNames();
	const comentarios = useComentariosIniciativa(isValidId ? iniciativaId : undefined);
	const tareas = useTareasIniciativa(isValidId ? iniciativaId : undefined);
	const [ready, setReady] = React.useState<boolean>(false);
	const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
	const [isEstadoOpen, setIsEstadoOpen] = React.useState<boolean>(false);
	const [isTareaOpen, setIsTareaOpen] = React.useState<boolean>(false);
	const [trackingResultado, setTrackingResultado] = React.useState<ResultadoClave | undefined>(undefined);
	const [noticeMessage, setNoticeMessage] = React.useState<string | undefined>(undefined);
	const closeNotice = React.useCallback((): void => setNoticeMessage(undefined), []);

	React.useEffect(() => {
		Promise.all([getIniciativas(), getObjetivos(), getAreas(), getResultados()]).then(() => setReady(true));
	}, []);

	const iniciativa = isValidId ? iniciativaState.items.filter((item) => item.Id === iniciativaId)[0] : undefined;
	const objetivo = names.resolve(objetivoState.items.filter((item) => item.Id === iniciativa?.Objetivo?.Id))[0];
	const puedeEditar = canEdit(iniciativa?.Accountable);
	const puedeCambiarEstado = canChangeEstado(iniciativa?.Accountable);
	const puedeSeguir = canTrackResultadoClave(iniciativa?.Accountable);
	const delObjetivo = iniciativaState.items.filter((item) => item.Objetivo?.Id === iniciativa?.Objetivo?.Id);
	const pesos = iniciativa ? getPesosIniciativa(iniciativa, delObjetivo, objetivo) : {};
	const areaNames = (iniciativa?.Area ?? [])
		.map((area) => areaState.items.filter((item) => item.Id === area.Id)[0]?.Nombre ?? area.Title)
		.join(NAME_SEPARATOR);
	const ultimoComentario = getUltimoComentario(comentarios.items, iniciativaId);
	const resultados = resultadoState.items.filter((item) => item.Iniciativa?.Id === iniciativaId);
	const loadError = iniciativaState.error || objetivoState.error || areaState.error || comentarios.error || resultadoState.error || names.error;
	const loaded = ready && names.ready;
	const notFound = !isValidId || (loaded && !loadError && !iniciativa);
	const isRrii = isVpRrii(objetivo?.VP?.Title);

	const goBack = (): void => {
		const from = getFrom(location.state);
		if (from) {
			navigate(from);
		}
		else if (iniciativa?.Objetivo) {
			navigate(getObjetivoPath(iniciativa.Objetivo.Id));
		}
		else {
			navigate(INICIATIVAS_PATH);
		}
	};

	const openTarea = (tareaId: number): void => {
		navigate(getTareaPath(tareaId), { state: { from: location.pathname + location.search } });
	};

	const onEdited = (saved: Iniciativa): void => {
		setIsFormOpen(false);
		getIniciativas();
		getResultados();
		setNoticeMessage(Utils.replaceAll(strings.IniciativaUpdated, '{0}', saved.Nombre ?? ''));
	};

	const onEstadoSaved = (): void => {
		setIsEstadoOpen(false);
		getIniciativas();
		comentarios.reload();
		setNoticeMessage(Utils.replaceAll(strings.IniciativaStatusUpdated, '{0}', iniciativa?.Nombre ?? ''));
	};

	const onTareaCreated = (tarea: Tarea): void => {
		setIsTareaOpen(false);
		tareas.reload();
		setNoticeMessage(Utils.replaceAll(strings.TareaCreated, '{0}', tarea.Nombre ?? ''));
	};

	const onTracked = (): void => {
		const nombre = trackingResultado?.Nombre ?? '';
		setTrackingResultado(undefined);
		getResultados();
		setNoticeMessage(Utils.replaceAll(strings.ResultadoClaveUpdated, '{0}', nombre));
	};

	const renderBody = (): React.ReactNode => {
		if (notFound) {
			return <MessageBar type="error" message={strings.IniciativaNotFound} />;
		}
		if (loadError) {
			return <MessageBar type="error" message={strings.IniciativaLoadError} />;
		}
		if (!loaded || !iniciativa) {
			return <Spinner />;
		}
		return (
			<>
				<IniciativaInfo
					iniciativa={iniciativa}
					objetivo={objetivo}
					areaNames={areaNames}
					pesos={canViewPesos ? pesos : {}}
					onEdit={puedeEditar ? () => setIsFormOpen(true) : undefined}
				/>
				{isRrii && <IniciativaResultadosClave resultados={resultados} onTrack={puedeSeguir ? setTrackingResultado : undefined} />}
				<IniciativaComentario comentario={ultimoComentario} onEdit={puedeCambiarEstado ? () => setIsEstadoOpen(true) : undefined} />
				{tareas.error
					? <MessageBar type="error" message={strings.TareasLoadError} actions={<Button variant="secondary" onClick={() => { tareas.reload(); }}>{strings.TareasRetry}</Button>} />
					: (
						<>
							<IniciativaTareasIndicadores tareas={tareas.items} />
							<IniciativaTareas tareas={tareas.items} onView={openTarea} />
						</>
					)}
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
					objetivoNombre={iniciativa ? objetivo?.Nombre ?? iniciativa.Objetivo?.Title : undefined}
					objetivoId={iniciativa?.Objetivo?.Id}
					iniciativaNombre={iniciativa?.Nombre}
				/>
				<div className={styles.header} style={{ gap: spacing.md }}>
					<BackButton onClick={goBack} />
					{iniciativa && (
						<>
							<h1 style={HEADER_TITLE_STYLE}>
								{formatIdNombre(formatIniciativaId(iniciativa.Id), iniciativa.Nombre)}
							</h1>
							<HeaderChip color={getEstadoIniciativaChipColor(iniciativa.Estado)} label={iniciativa.Estado ?? ''} />
							{isRrii && loaded && (
								<div className={styles.headerEnd} style={{ gap: spacing.md }}>
									<span style={PROGRESS_LABEL_STYLE}>
										{strings.ObjetivoDetailProgress} <AvanceText value={getAvanceIniciativa(resultados)} spaced />
									</span>
								</div>
							)}
						</>
					)}
				</div>
				{renderBody()}
				<DetailFooter>
					<Button variant="secondary" onClick={goBack}>
						{strings.Cancel}
					</Button>
					{puedeEditar && iniciativa && (
						<Button variant="primary" onClick={() => setIsFormOpen(true)}>
							{strings.Edit}
						</Button>
					)}
					{puedeCambiarEstado && iniciativa && (
						<Button variant="primary" style={CHANGE_STATUS_STYLE} onClick={() => setIsEstadoOpen(true)}>
							{strings.IniciativaChangeStatus}
						</Button>
					)}
					{canCreateTarea && iniciativa && (
						<Button
							variant="primary"
							style={NEW_TAREA_STYLE}
							disabled={!canCargarTarea(iniciativa, tareas.items)}
							onClick={() => setIsTareaOpen(true)}
						>
							{strings.TareaNew}
						</Button>
					)}
				</DetailFooter>
				{isFormOpen && iniciativa && <IniciativaFormPanel iniciativa={iniciativa} canLoadResultadosClave={canLoadResultadosClave} onSaved={onEdited} onCancel={() => setIsFormOpen(false)} />}
				{isEstadoOpen && iniciativa && (
					<IniciativaEstadoPanel
						iniciativa={iniciativa}
						ultimoComentario={ultimoComentario}
						onSaved={onEstadoSaved}
						onCancel={() => setIsEstadoOpen(false)}
					/>
				)}
				{isTareaOpen && iniciativa && (
					<TareaFormPanel iniciativaFijaId={iniciativa.Id} onSaved={onTareaCreated} onCancel={() => setIsTareaOpen(false)} />
				)}
				{trackingResultado && (
					<ResultadoClaveSeguimientoPanel
						resultado={trackingResultado}
						accountable={iniciativa?.Accountable}
						onSaved={onTracked}
						onCancel={() => setTrackingResultado(undefined)}
					/>
				)}
			</div>
		</>
	);
};

export default IniciativaDetalle;

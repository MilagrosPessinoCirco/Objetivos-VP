import * as React from 'react';
import type { CSSProperties } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../../../../core/ui/components';
import { MessageBar, Spinner } from '../../../../../core/ui/patterns';
import { spacing } from '../../../../../core/ui/foundations';
import useAreaDataSource from '../../../../../core/api/Area/useAreaDataSource';
import useComentariosIniciativa from '../../../../../core/api/ComentarioIniciativa/useComentariosIniciativa';
import useIniciativaDataSource from '../../../../../core/api/Iniciativa/useIniciativaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import { Iniciativa } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { INICIATIVAS_PATH, getObjetivoPath } from '../../ObjetivosVp/routes';
import BackButton from '../../shared/BackButton/BackButton';
import DetailFooter from '../../shared/DetailFooter/DetailFooter';
import HeaderChip from '../../shared/HeaderChip/HeaderChip';
import SuccessNotice from '../../shared/SuccessNotice/SuccessNotice';
import { getColorStep } from '../../shared/getColorStep';
import { HEADER_TITLE_STYLE } from '../../shared/pageTitleStyle';
import PalancaBreadcrumb from '../../Palanca/PalancaBreadcrumb/PalancaBreadcrumb';
import { isVpRrii } from '../../Objetivo/objetivoUtils';
import IniciativaEstadoPanel from '../IniciativaEstadoPanel/IniciativaEstadoPanel';
import IniciativaFormPanel from '../IniciativaForm/IniciativaFormPanel';
import { formatIdNombre, formatIniciativaId, getEstadoIniciativaChipColor, getPesosIniciativa, getUltimoComentario } from '../iniciativaUtils';
import IniciativaComentario from './IniciativaComentario/IniciativaComentario';
import IniciativaInfo from './IniciativaInfo/IniciativaInfo';
import styles from './IniciativaDetalle.module.scss';

export interface IIniciativaDetalleProps {
	canEdit: boolean;
	canChangeEstado: boolean;
}

const PAGE_PADDING = `${spacing.xl} ${spacing.xl} 96px`;
const NAME_SEPARATOR = ', ';

const CHANGE_STATUS_COLOR = getColorStep('Secondary', '700').value;
const CHANGE_STATUS_STYLE: CSSProperties = { backgroundColor: CHANGE_STATUS_COLOR, borderColor: CHANGE_STATUS_COLOR };

const getFrom = (state: unknown): string | undefined => {
	const from = typeof state === 'object' && state !== null && 'from' in state ? (state as { from: unknown }).from : undefined;
	return typeof from === 'string' ? from : undefined;
};

const IniciativaDetalle: React.FC<IIniciativaDetalleProps> = ({ canEdit, canChangeEstado }) => {
	const { id } = useParams<{ id: string }>();
	const iniciativaId = Number(id);
	const isValidId = Number.isInteger(iniciativaId) && iniciativaId > 0;
	const navigate = useNavigate();
	const location = useLocation();
	const [iniciativaState, getIniciativas] = useIniciativaDataSource();
	const [objetivoState, getObjetivos] = useObjetivoDataSource();
	const [areaState, getAreas] = useAreaDataSource();
	const comentarios = useComentariosIniciativa(isValidId ? iniciativaId : undefined);
	const [ready, setReady] = React.useState<boolean>(false);
	const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
	const [isEstadoOpen, setIsEstadoOpen] = React.useState<boolean>(false);
	const [noticeMessage, setNoticeMessage] = React.useState<string | undefined>(undefined);
	const closeNotice = React.useCallback((): void => setNoticeMessage(undefined), []);

	React.useEffect(() => {
		Promise.all([getIniciativas(), getObjetivos(), getAreas()]).then(() => setReady(true));
	}, []);

	const iniciativa = isValidId ? iniciativaState.items.filter((item) => item.Id === iniciativaId)[0] : undefined;
	const objetivo = objetivoState.items.filter((item) => item.Id === iniciativa?.Objetivo?.Id)[0];
	const delObjetivo = iniciativaState.items.filter((item) => item.Objetivo?.Id === iniciativa?.Objetivo?.Id);
	const pesos = iniciativa ? getPesosIniciativa(iniciativa, delObjetivo, objetivo) : {};
	const areaNames = (iniciativa?.Area ?? [])
		.map((area) => areaState.items.filter((item) => item.Id === area.Id)[0]?.Nombre ?? area.Title)
		.join(NAME_SEPARATOR);
	const ultimoComentario = getUltimoComentario(comentarios.items, iniciativaId);
	const loadError = iniciativaState.error || objetivoState.error || areaState.error || comentarios.error;
	const notFound = !isValidId || (ready && !loadError && !iniciativa);
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

	const onEdited = (saved: Iniciativa): void => {
		setIsFormOpen(false);
		getIniciativas();
		setNoticeMessage(Utils.replaceAll(strings.IniciativaUpdated, '{0}', saved.Nombre ?? ''));
	};

	const onEstadoSaved = (): void => {
		setIsEstadoOpen(false);
		getIniciativas();
		comentarios.reload();
		setNoticeMessage(Utils.replaceAll(strings.IniciativaStatusUpdated, '{0}', iniciativa?.Nombre ?? ''));
	};

	const renderBody = (): React.ReactNode => {
		if (notFound) {
			return <MessageBar type="error" message={strings.IniciativaNotFound} />;
		}
		if (loadError) {
			return <MessageBar type="error" message={strings.IniciativaLoadError} />;
		}
		if (!ready || !iniciativa) {
			return <Spinner />;
		}
		return (
			<>
				<IniciativaInfo
					iniciativa={iniciativa}
					objetivo={objetivo}
					areaNames={areaNames}
					pesos={pesos}
					onEdit={canEdit ? () => setIsFormOpen(true) : undefined}
				/>
				<IniciativaComentario comentario={ultimoComentario} onEdit={canChangeEstado ? () => setIsEstadoOpen(true) : undefined} />
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
						</>
					)}
				</div>
				{renderBody()}
				<DetailFooter>
					<Button variant="secondary" onClick={goBack}>
						{strings.Cancel}
					</Button>
					{canEdit && iniciativa && (
						<Button variant="primary" onClick={() => setIsFormOpen(true)}>
							{strings.Edit}
						</Button>
					)}
					{canChangeEstado && iniciativa && (
						<Button variant="primary" style={CHANGE_STATUS_STYLE} onClick={() => setIsEstadoOpen(true)}>
							{strings.IniciativaChangeStatus}
						</Button>
					)}
				</DetailFooter>
				{isFormOpen && iniciativa && <IniciativaFormPanel iniciativa={iniciativa} onSaved={onEdited} onCancel={() => setIsFormOpen(false)} />}
				{isEstadoOpen && iniciativa && (
					<IniciativaEstadoPanel
						iniciativa={iniciativa}
						ultimoComentario={ultimoComentario}
						onSaved={onEstadoSaved}
						onCancel={() => setIsEstadoOpen(false)}
					/>
				)}
			</div>
		</>
	);
};

export default IniciativaDetalle;

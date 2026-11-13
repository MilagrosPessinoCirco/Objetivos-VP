import * as React from 'react';
import type { CSSProperties } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../../../../core/ui/components';
import { MessageBar, Spinner } from '../../../../../core/ui/patterns';
import { spacing, typography } from '../../../../../core/ui/foundations';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { PALANCAS_PATH, getObjetivoEditPath } from '../../ObjetivosVp/routes';
import BackButton from '../../shared/BackButton/BackButton';
import DetailFooter from '../../shared/DetailFooter/DetailFooter';
import HeaderChip from '../../shared/HeaderChip/HeaderChip';
import LocationButton from '../../shared/LocationButton/LocationButton';
import { getColorStep } from '../../shared/getColorStep';
import { HEADER_TITLE_STYLE } from '../../shared/pageTitleStyle';
import PalancaBreadcrumb from '../../Palanca/PalancaBreadcrumb/PalancaBreadcrumb';
import { DEFAULT_PROGRESS, formatObjetivoId, getEstadoChipColor, isNotFoundError, isVpRrii } from '../objetivoUtils';
import useObjetivoNames from '../useObjetivoNames';
import ObjetivoInfo from './ObjetivoInfo/ObjetivoInfo';
import styles from './ObjetivoDetalle.module.scss';

export interface IObjetivoDetalleProps {
	canEditObjetivo: boolean;
}

type LoadError = 'notFound' | 'error';

interface IObjetivoLocationState {
	toast?: string;
}

const PAGE_PADDING = `${spacing.xl} ${spacing.xl} 96px`;
const NOTICE_DURATION_MS = 7000;

const PROGRESS_LABEL_STYLE: CSSProperties = {
	fontFamily: typography.family.base,
	fontSize: typography.size[14],
	lineHeight: typography.lineHeight[14]
};
const PROGRESS_VALUE_STYLE: CSSProperties = { fontWeight: typography.weight.bold, color: getColorStep('Red', '600').value };

const ObjetivoDetalle: React.FC<IObjetivoDetalleProps> = ({ canEditObjetivo }) => {
	const { id } = useParams<{ id: string }>();
	const objetivoId = Number(id);
	const isValidId = Number.isInteger(objetivoId) && objetivoId > 0;
	const navigate = useNavigate();
	const location = useLocation();
	const [state, , , , , getById] = useObjetivoDataSource();
	const names = useObjetivoNames();
	const [loadError, setLoadError] = React.useState<LoadError | undefined>(undefined);
	const [noticeMessage, setNoticeMessage] = React.useState<string | undefined>((location.state as IObjetivoLocationState | null)?.toast);
	const closeNotice = React.useCallback((): void => setNoticeMessage(undefined), []);

	React.useEffect(() => {
		if (noticeMessage === undefined) {
			return undefined;
		}
		const timer = window.setTimeout(closeNotice, NOTICE_DURATION_MS);
		return () => window.clearTimeout(timer);
	}, [noticeMessage]);

	React.useEffect(() => {
		setLoadError(undefined);
		if (!isValidId) {
			setLoadError('notFound');
			return;
		}
		getById(objetivoId).catch((error: unknown) => setLoadError(isNotFoundError(error) ? 'notFound' : 'error'));
	}, [objetivoId]);

	const loaded = !loadError && state.item?.Id === objetivoId && names.ready ? state.item : undefined;
	const objetivo = loaded ? names.resolve([loaded])[0] : undefined;
	const goPalancas = (): void => navigate(PALANCAS_PATH);

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
		return <ObjetivoInfo objetivo={objetivo} onEdit={canEditObjetivo ? () => navigate(getObjetivoEditPath(objetivoId)) : undefined} />;
	};

	return (
		<>
			{noticeMessage !== undefined && (
				<div className={styles.notice}>
					<MessageBar className={styles.noticeBar} type="success" darkMode={false} message={noticeMessage} dismissible onClose={closeNotice} />
				</div>
			)}
			<div className={styles.detalle} style={{ gap: spacing.lg, padding: PAGE_PADDING }}>
				<PalancaBreadcrumb
					palancaNombre={objetivo?.Palanca?.Title}
					palancaId={objetivo?.Palanca?.Id}
					objetivoNombre={objetivo?.Nombre}
				/>
				<div className={styles.header} style={{ gap: spacing.md }}>
					<BackButton onClick={goPalancas} />
					{objetivo && (
						<>
							<h1 style={HEADER_TITLE_STYLE}>
								{Utils.replaceAll(Utils.replaceAll(strings.ObjetivoDetailTitle, '{0}', formatObjetivoId(objetivo.Id)), '{1}', objetivo.Nombre ?? '')}
							</h1>
							<HeaderChip color={getEstadoChipColor(objetivo.Estado)} label={objetivo.Estado ?? ''} />
							<div className={styles.headerEnd} style={{ gap: spacing.md }}>
								{isVpRrii(objetivo.VP?.Title) && (
									<span style={PROGRESS_LABEL_STYLE}>
										{strings.ObjetivoDetailProgress} <b style={PROGRESS_VALUE_STYLE}>{`${DEFAULT_PROGRESS}%`}</b>
									</span>
								)}
								<LocationButton />
							</div>
						</>
					)}
				</div>
				{renderBody()}
				<DetailFooter>
					<Button variant="secondary" onClick={goPalancas}>
						{strings.Cancel}
					</Button>
					{canEditObjetivo && objetivo && (
						<Button variant="primary" onClick={() => navigate(getObjetivoEditPath(objetivoId))}>
							{strings.Edit}
						</Button>
					)}
				</DetailFooter>
			</div>
		</>
	);
};

export default ObjetivoDetalle;

import * as React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../../../core/ui/components';
import { Chip, MessageBar, Spinner } from '../../../../core/ui/patterns';
import { FigmaIcon, spacing } from '../../../../core/ui/foundations';
import useObjetivoDataSource from '../../../../core/api/Objetivo/useObjetivoDataSource';
import { Utils } from '../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { PALANCAS_PATH, getObjetivoEditPath } from '../ObjetivosVp/routes';
import { PAGE_TITLE_STYLE } from '../Palancas/pageTitleStyle';
import PalancaBreadcrumb from '../PalancaDetalle/PalancaBreadcrumb/PalancaBreadcrumb';
import { formatObjetivoId, getEstadoChipColor, isNotFoundError } from '../objetivoUtils';
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

const NOTICE_DURATION_MS = 7000;

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
		return <ObjetivoInfo objetivo={objetivo} />;
	};

	return (
		<>
			{noticeMessage !== undefined && (
				<div className={styles.notice}>
					<MessageBar className={styles.noticeBar} type="success" darkMode={false} message={noticeMessage} dismissible onClose={closeNotice} />
				</div>
			)}
			<div className={styles.detalle} style={{ gap: spacing.lg, padding: spacing.xl }}>
				<PalancaBreadcrumb
					palancaNombre={objetivo?.Palanca?.Title}
					palancaId={objetivo?.Palanca?.Id}
					objetivoNombre={objetivo?.Nombre}
				/>
				<div className={styles.header} style={{ gap: spacing.md }}>
					<Button variant="secondary" size="small" iconLeft={<FigmaIcon name="arrowCircle" />} onClick={goPalancas}>
						{strings.Back}
					</Button>
					{objetivo && (
						<>
							<h1 style={PAGE_TITLE_STYLE}>
								{Utils.replaceAll(Utils.replaceAll(strings.ObjetivoDetailTitle, '{0}', formatObjetivoId(objetivo.Id)), '{1}', objetivo.Nombre ?? '')}
							</h1>
							<Chip size="small" clickable={false} color={getEstadoChipColor(objetivo.Estado)} label={objetivo.Estado ?? ''} />
						</>
					)}
				</div>
				{renderBody()}
				<div className={styles.footer} style={{ gap: spacing.lg }}>
					<Button variant="secondary" onClick={goPalancas}>
						{strings.Back}
					</Button>
					{canEditObjetivo && objetivo && (
						<Button variant="primary" onClick={() => navigate(getObjetivoEditPath(objetivoId))}>
							{strings.Edit}
						</Button>
					)}
				</div>
			</div>
		</>
	);
};

export default ObjetivoDetalle;

import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../../../core/ui/components';
import { Chip, MessageBar, Spinner } from '../../../../core/ui/patterns';
import { FigmaIcon, spacing } from '../../../../core/ui/foundations';
import usePalancaDataSource from '../../../../core/api/Palanca/usePalancaDataSource';
import { Utils } from '../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { PALANCAS_PATH } from '../ObjetivosVp/routes';
import { formatPalancaId } from '../Palancas/formatPalancaId';
import { PAGE_TITLE_STYLE } from '../Palancas/pageTitleStyle';
import PalancaBreadcrumb from './PalancaBreadcrumb/PalancaBreadcrumb';
import PalancaInfo from './PalancaInfo/PalancaInfo';
import styles from './PalancaDetalle.module.scss';

export interface IPalancaDetalleProps {
	canManage: boolean;
}

type LoadError = 'notFound' | 'error';

const NOT_FOUND_STATUS = 404;

const isNotFoundError = (error: unknown): boolean =>
	typeof error === 'object' && error !== null && 'status' in error &&
	(error as { status: unknown }).status === NOT_FOUND_STATUS;

const PalancaDetalle: React.FC<IPalancaDetalleProps> = () => {
	const { id } = useParams<{ id: string }>();
	const palancaId = Number(id);
	const isValidId = Number.isInteger(palancaId) && palancaId > 0;
	const navigate = useNavigate();
	const [state, , , , , getById] = usePalancaDataSource();
	const [loadError, setLoadError] = React.useState<LoadError | undefined>(undefined);

	React.useEffect(() => {
		setLoadError(undefined);
		if (!isValidId) {
			setLoadError('notFound');
			return;
		}
		getById(palancaId).catch((error: unknown) => setLoadError(isNotFoundError(error) ? 'notFound' : 'error'));
	}, [palancaId]);

	const palanca = !loadError && state.item?.Id === palancaId ? state.item : undefined;
	const goPalancas = (): void => navigate(PALANCAS_PATH);

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
		return <PalancaInfo palanca={palanca} />;
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
			</div>
		</div>
	);
};

export default PalancaDetalle;

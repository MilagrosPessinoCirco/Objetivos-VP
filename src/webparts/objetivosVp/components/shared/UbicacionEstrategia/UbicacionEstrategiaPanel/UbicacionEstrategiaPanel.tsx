import * as React from 'react';

import { Button } from '../../../../../../core/ui/components';
import { MessageBar, Panel, Spinner } from '../../../../../../core/ui/patterns';
import type { TipoEntidad } from '../../../../../../core/api/UbicacionEstrategia/useUbicacionEstrategia';
import { Utils } from '../../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { buildPanelTitle } from '../../panelTitle';
import UbicacionNivel, { UBICACION_COLOR_VARS } from '../UbicacionNivel/UbicacionNivel';
import { formatEntidadId } from '../ubicacionUtils';
import type { INivel } from '../ubicacionUtils';
import styles from './UbicacionEstrategiaPanel.module.scss';

export interface IUbicacionEstrategiaPanelProps {
	tipo: TipoEntidad;
	id: number;
	niveles?: INivel[];
	error: boolean;
	onRetry: () => void;
	onNavigate: (path: string) => void;
	onClose: () => void;
}

const UbicacionEstrategiaPanel: React.FC<IUbicacionEstrategiaPanelProps> = ({ tipo, id, niveles, error, onRetry, onNavigate, onClose }) => {
	const renderBody = (): React.ReactNode => {
		if (error) {
			return (
				<MessageBar
					type="error"
					message={strings.UbicacionErrorCarga}
					actions={<Button variant="secondary" onClick={onRetry}>{strings.TareasRetry}</Button>}
				/>
			);
		}
		if (!niveles) {
			return <Spinner text={strings.UbicacionCargando} />;
		}
		return (
			<ol className={styles.ubi} style={UBICACION_COLOR_VARS}>
				{niveles.map((nivel) => <UbicacionNivel key={nivel.key} nivel={nivel} onNavigate={onNavigate} />)}
			</ol>
		);
	};

	return (
		<Panel
			open
			className={styles.panel}
			title={buildPanelTitle(strings.UbicacionTitulo, Utils.replaceAll(strings.UbicacionSubtitulo, '{0}', formatEntidadId(tipo, id)))}
			onClose={onClose}
			primaryAction={<Button variant="secondary" onClick={onClose}>{strings.TareaHistoryClose}</Button>}
			secondaryAction={<></>}
		>
			{renderBody()}
		</Panel>
	);
};

export default UbicacionEstrategiaPanel;

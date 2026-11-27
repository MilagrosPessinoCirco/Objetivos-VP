import * as React from 'react';

import { Button } from '../../../../../core/ui/components';
import { MessageBar, Panel, Spinner } from '../../../../../core/ui/patterns';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import { Objetivo } from '../../../../../core/entities';
import { assertPermiso } from '../../../../../core/utils/Permisos';
import * as strings from 'ObjetivosVpWebPartStrings';
import { usePermisos } from '../../shared/PermisosProvider';
import { ObjetivoFormBody } from './ObjetivoForm';
import useObjetivoFormMasters from './useObjetivoFormMasters';
import styles from './ObjetivoForm.module.scss';

export interface IObjetivoFormPanelProps {
	initialPalancaId?: number;
	objetivo?: Objetivo;
	onSaved: (objetivo: Objetivo) => void;
	onCancel: () => void;
}

const ObjetivoFormPanel: React.FC<IObjetivoFormPanelProps> = ({ initialPalancaId, objetivo, onSaved, onCancel }) => {
	const { verificar } = usePermisos();
	const masters = useObjetivoFormMasters();
	const [, , addItem, editItem] = useObjetivoDataSource();

	const save = async (toSave: Objetivo): Promise<void> => {
		const permisos = await verificar();
		assertPermiso(objetivo ? permisos.canEditObjetivo : permisos.canCreateObjetivo);
		if (objetivo) {
			await editItem(toSave);
		}
		else {
			await addItem(toSave);
		}
		onSaved(toSave);
	};

	if (masters.error || !masters.ready) {
		return (
			<Panel
				open
				className={styles.panel}
				title={objetivo ? strings.ObjetivoFormEditTitle : strings.ObjetivoNew}
				onClose={onCancel}
				primaryAction={<Button variant="secondary" onClick={onCancel}>{strings.Cancel}</Button>}
			>
				{masters.error ? <MessageBar type="error" message={strings.ObjetivoFormLoadError} /> : <Spinner />}
			</Panel>
		);
	}

	return (
		<ObjetivoFormBody
			vps={masters.vps}
			departamentos={masters.departamentos}
			gerencias={masters.gerencias}
			palancas={masters.palancas}
			initialPalancaId={initialPalancaId}
			objetivo={objetivo}
			onSave={save}
			onCancel={onCancel}
		/>
	);
};

export default ObjetivoFormPanel;

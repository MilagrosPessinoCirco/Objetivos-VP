import * as React from 'react';

import { Button } from '../../../../../core/ui/components';
import { MessageBar, Panel, Spinner } from '../../../../../core/ui/patterns';
import useIniciativaDataSource from '../../../../../core/api/Iniciativa/useIniciativaDataSource';
import { Iniciativa } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatIniciativaId } from '../iniciativaUtils';
import { IniciativaFormBody } from './IniciativaForm';
import useIniciativaFormMasters from './useIniciativaFormMasters';
import styles from './IniciativaForm.module.scss';

export interface IIniciativaFormPanelProps {
	iniciativa?: Iniciativa;
	initialObjetivoId?: number;
	onSaved: (iniciativa: Iniciativa) => void;
	onCancel: () => void;
}

const IniciativaFormPanel: React.FC<IIniciativaFormPanelProps> = ({ iniciativa, initialObjetivoId, onSaved, onCancel }) => {
	const masters = useIniciativaFormMasters();
	const [, , addItem, editItem] = useIniciativaDataSource();

	const save = async (toSave: Iniciativa): Promise<void> => {
		if (iniciativa) {
			await editItem(toSave);
			onSaved(toSave);
		}
		else {
			onSaved(await addItem(toSave));
		}
	};

	if (masters.error || !masters.ready) {
		return (
			<Panel
				open
				className={styles.panel}
				title={iniciativa ? Utils.replaceAll(strings.IniciativaFormEditTitle, '{0}', formatIniciativaId(iniciativa.Id)) : strings.IniciativaNew}
				onClose={onCancel}
				primaryAction={<Button variant="secondary" onClick={onCancel}>{strings.Cancel}</Button>}
				secondaryAction={<Button variant="primary" disabled>{iniciativa ? strings.SaveChanges : strings.IniciativaNew}</Button>}
			>
				{masters.error ? <MessageBar type="error" message={strings.ObjetivoFormLoadError} /> : <Spinner />}
			</Panel>
		);
	}

	return (
		<IniciativaFormBody
			objetivos={masters.objetivos}
			areas={masters.areas}
			usuarios={masters.usuarios}
			currentUser={masters.currentUser}
			initialObjetivoId={initialObjetivoId}
			iniciativa={iniciativa}
			onSave={save}
			onCancel={onCancel}
		/>
	);
};

export default IniciativaFormPanel;

import * as React from 'react';

import { Button } from '../../../../../core/ui/components';
import { ActivityItems, MessageBar, Panel, Spinner } from '../../../../../core/ui/patterns';
import type { IActivityItem } from '../../../../../core/ui/patterns';
import useAvancesTarea from '../../../../../core/api/AvanceTarea/useAvancesTarea';
import { Tarea } from '../../../../../core/entities';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { buildPanelTitle } from '../../shared/panelTitle';
import { formatDate } from '../../Objetivo/objetivoUtils';
import { formatIdNombre } from '../../Iniciativa/iniciativaUtils';
import { formatTareaId } from '../tareaUtils';
import styles from './TareaHistorialPanel.module.scss';

export interface ITareaHistorialPanelProps {
	tarea: Tarea;
	onClose: () => void;
}

const TareaHistorialPanel: React.FC<ITareaHistorialPanelProps> = ({ tarea, onClose }) => {
	const avances = useAvancesTarea(tarea.Id);

	const items: IActivityItem[] = avances.items.map((entrada) => ({
		key: String(entrada.Id),
		variant: 'comment',
		author: entrada.Author?.Title ?? '',
		verb: strings.TareaHistoryVerb,
		subject: Utils.replaceAll(Utils.replaceAll(strings.TareaHistorySubject, '{0}', entrada.Estado ?? ''), '{1}', String(entrada.Avance ?? 0)),
		description: entrada.Comentario,
		time: formatDate(entrada.Created)
	}));

	const renderBody = (): React.ReactNode => {
		if (avances.error) {
			return <MessageBar type="error" message={strings.TareaHistoryLoadError} />;
		}
		if (avances.isLoading) {
			return <Spinner />;
		}
		return <ActivityItems className={styles.items} items={items} title={strings.TareaHistory} emptyMessage={strings.TareaHistoryEmpty} />;
	};

	return (
		<Panel
			open
			className={styles.panel}
			title={buildPanelTitle(strings.TareaHistory, formatIdNombre(formatTareaId(tarea.Id), tarea.Nombre))}
			onClose={onClose}
			primaryAction={<Button variant="secondary" onClick={onClose}>{strings.TareaHistoryClose}</Button>}
			secondaryAction={<></>}
		>
			{renderBody()}
		</Panel>
	);
};

export default TareaHistorialPanel;

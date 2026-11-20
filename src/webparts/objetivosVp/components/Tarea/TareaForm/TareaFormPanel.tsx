import * as React from 'react';

import { Button } from '../../../../../core/ui/components';
import { MessageBar, Panel, Spinner } from '../../../../../core/ui/patterns';
import useAvanceTareaDataSource from '../../../../../core/api/AvanceTarea/useAvanceTareaDataSource';
import useTareaDataSource from '../../../../../core/api/Tarea/useTareaDataSource';
import useTareasIniciativa from '../../../../../core/api/Tarea/useTareasIniciativa';
import { AvanceTarea, Tarea } from '../../../../../core/entities';
import { EstadoTarea } from '../../../../../core/utils/Constants';
import * as strings from 'ObjetivosVpWebPartStrings';
import { createTopeError, getTopeIssue } from '../tareaUtils';
import { TareaFormBody } from './TareaForm';
import useTareaFormMasters from './useTareaFormMasters';
import styles from './TareaForm.module.scss';

export interface ITareaFormPanelProps {
	iniciativaFijaId?: number;
	onSaved: (tarea: Tarea) => void;
	onCancel: () => void;
}

const buildPrimeraEntrada = (tarea: Tarea): AvanceTarea =>
	Object.assign(new AvanceTarea(), {
		Tarea: { Id: tarea.Id as number, Title: tarea.Nombre ?? '' },
		Avance: 0,
		Estado: EstadoTarea.NoIniciada,
		Comentario: strings.TareaFirstEntryComment
	});

const TareaFormPanel: React.FC<ITareaFormPanelProps> = ({ iniciativaFijaId, onSaved, onCancel }) => {
	const masters = useTareaFormMasters();
	const tareas = useTareasIniciativa(undefined);
	const [, , addTarea, , deleteTarea] = useTareaDataSource();
	const [, , addEntrada] = useAvanceTareaDataSource();
	const tareaCreada = React.useRef<Tarea | undefined>(undefined);
	const entradaCreada = React.useRef<AvanceTarea | undefined>(undefined);

	const deshacerAlta = async (): Promise<void> => {
		await deleteTarea(tareaCreada.current?.Id as number);
		tareaCreada.current = undefined;
	};

	const save = async (toSave: Tarea): Promise<void> => {
		if (!tareaCreada.current) {
			const frescas = await tareas.reload(toSave.Iniciativa?.Id);
			const topeIssue = getTopeIssue(frescas);
			if (topeIssue) {
				throw createTopeError(topeIssue);
			}
			toSave.FechaUltimaActualizacion = new Date();
			tareaCreada.current = await addTarea(toSave);
		}
		try {
			if (!entradaCreada.current) {
				entradaCreada.current = await addEntrada(buildPrimeraEntrada(tareaCreada.current));
			}
		}
		catch (saveError) {
			const rethrow = (): never => {
				throw saveError;
			};
			return deshacerAlta().then(rethrow, rethrow);
		}
		onSaved(tareaCreada.current);
	};

	if (masters.error || !masters.ready) {
		return (
			<Panel
				open
				className={styles.panel}
				title={strings.TareaNew}
				onClose={onCancel}
				primaryAction={<Button variant="secondary" onClick={onCancel}>{strings.Cancel}</Button>}
				secondaryAction={<Button variant="primary" disabled>{strings.TareaNew}</Button>}
			>
				{masters.error ? <MessageBar type="error" message={strings.ObjetivoFormLoadError} /> : <Spinner />}
			</Panel>
		);
	}

	return (
		<TareaFormBody
			iniciativas={masters.iniciativas}
			objetivos={masters.objetivos}
			areas={masters.areas}
			usuarios={masters.usuarios}
			currentUser={masters.currentUser}
			iniciativaFijaId={iniciativaFijaId}
			onSave={save}
			onCancel={onCancel}
		/>
	);
};

export default TareaFormPanel;

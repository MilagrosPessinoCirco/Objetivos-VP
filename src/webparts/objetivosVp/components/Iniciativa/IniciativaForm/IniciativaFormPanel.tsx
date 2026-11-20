import * as React from 'react';

import { Button } from '../../../../../core/ui/components';
import { MessageBar, Panel, Spinner } from '../../../../../core/ui/patterns';
import useIniciativaDataSource from '../../../../../core/api/Iniciativa/useIniciativaDataSource';
import useResultadoClaveDataSource from '../../../../../core/api/ResultadoClave/useResultadoClaveDataSource';
import { Iniciativa, ResultadoClave } from '../../../../../core/entities';
import { TipoMedicion } from '../../../../../core/utils/Constants';
import { Utils } from '../../../../../core/utils';
import * as strings from 'ObjetivosVpWebPartStrings';
import { formatIniciativaId } from '../iniciativaUtils';
import { IResultadoClaveDraft, isDraftChanged } from '../resultadoClaveUtils';
import { IniciativaFormBody } from './IniciativaForm';
import useIniciativaFormMasters from './useIniciativaFormMasters';
import styles from './IniciativaForm.module.scss';

export interface IIniciativaFormPanelProps {
	iniciativa?: Iniciativa;
	initialObjetivoId?: number;
	canLoadResultadosClave: boolean;
	onSaved: (iniciativa: Iniciativa) => void;
	onCancel: () => void;
}

const buildDefinicion = (draft: IResultadoClaveDraft, iniciativa: Iniciativa): ResultadoClave =>
	Object.assign(new ResultadoClave(), {
		Nombre: draft.nombre.trim(),
		TipoMedicion: draft.tipo as TipoMedicion,
		UnidadMedida: draft.unidad.trim(),
		Minimo: Number(draft.minimo),
		Meta: Number(draft.meta),
		Maximo: Number(draft.maximo),
		Iniciativa: { Id: iniciativa.Id as number, Title: iniciativa.Nombre ?? '' }
	});

const buildNuevo = (draft: IResultadoClaveDraft, iniciativa: Iniciativa): ResultadoClave =>
	Object.assign(buildDefinicion(draft, iniciativa), { ValorProyectado: Number(draft.meta) });

const IniciativaFormPanel: React.FC<IIniciativaFormPanelProps> = ({ iniciativa, initialObjetivoId, canLoadResultadosClave, onSaved, onCancel }) => {
	const masters = useIniciativaFormMasters(iniciativa?.Id);
	const [, , addItem, editItem, deleteItem] = useIniciativaDataSource();
	const [, , addResultado, editResultado, deleteResultado] = useResultadoClaveDataSource();
	const iniciativaCreada = React.useRef<Iniciativa | undefined>(undefined);
	const resultadosCreados = React.useRef<Record<number, ResultadoClave>>({});
	const vigentes = React.useRef<ResultadoClave[] | undefined>(undefined);

	const withIds = (drafts: IResultadoClaveDraft[]): IResultadoClaveDraft[] =>
		drafts.map((draft) => ({ ...draft, id: draft.id ?? resultadosCreados.current[draft.key]?.Id }));

	const crearPendientes = async (drafts: IResultadoClaveDraft[], destino: Iniciativa): Promise<void> => {
		for (const draft of drafts.filter((item) => item.id === undefined && !resultadosCreados.current[item.key])) {
			resultadosCreados.current[draft.key] = await addResultado(buildNuevo(draft, destino));
		}
	};

	const deshacerAlta = async (): Promise<void> => {
		for (const key of Object.keys(resultadosCreados.current).map(Number)) {
			await deleteResultado(resultadosCreados.current[key].Id as number);
			delete resultadosCreados.current[key];
		}
		if (iniciativaCreada.current) {
			await deleteItem(iniciativaCreada.current.Id as number);
			iniciativaCreada.current = undefined;
		}
	};

	const saveAlta = async (toSave: Iniciativa, drafts: IResultadoClaveDraft[]): Promise<IResultadoClaveDraft[]> => {
		try {
			if (!iniciativaCreada.current) {
				iniciativaCreada.current = await addItem(toSave);
			}
			await crearPendientes(drafts, iniciativaCreada.current);
		}
		catch (saveError) {
			const rethrow = (): never => {
				throw saveError;
			};
			if (drafts.length === 0) {
				rethrow();
			}
			return deshacerAlta().then(rethrow, rethrow);
		}
		const result = withIds(drafts);
		onSaved(iniciativaCreada.current);
		return result;
	};

	const saveEdicion = async (toSave: Iniciativa, drafts: IResultadoClaveDraft[]): Promise<IResultadoClaveDraft[]> => {
		if (!vigentes.current) {
			vigentes.current = masters.resultadosClave.slice();
		}
		await editItem(toSave);
		await crearPendientes(drafts, toSave);
		for (const draft of drafts.filter((item) => item.id !== undefined)) {
			const original = vigentes.current.filter((resultado) => resultado.Id === draft.id)[0];
			if (original && isDraftChanged(draft, original)) {
				const definicion = Object.assign(buildDefinicion(draft, toSave), { Id: draft.id });
				await editResultado(definicion);
				vigentes.current = vigentes.current.map((resultado) =>
					resultado.Id === draft.id ? Object.assign(new ResultadoClave(), resultado, definicion) : resultado);
			}
		}
		const result = withIds(drafts);
		onSaved(toSave);
		return result;
	};

	const save = (toSave: Iniciativa, drafts: IResultadoClaveDraft[]): Promise<IResultadoClaveDraft[]> =>
		iniciativa ? saveEdicion(toSave, drafts) : saveAlta(toSave, drafts);

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
			resultadosClave={masters.resultadosClave}
			canLoadResultadosClave={canLoadResultadosClave}
			onSave={save}
			onCancel={onCancel}
		/>
	);
};

export default IniciativaFormPanel;

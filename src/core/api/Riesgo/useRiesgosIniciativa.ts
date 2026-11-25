import { useEffect, useState } from 'react';

import { Tarea } from '../../entities';
import { EstadoTarea } from '../../utils/Constants';
import { IRiesgoConDecision } from './IRiesgoService';
import { getRiesgoService } from './RiesgoService';
import { getIndicadoresRiesgos } from './riesgoReglas';

export interface IRiesgosIniciativaState {
	items: IRiesgoConDecision[];
	indicadores: { activos: number; escalados: number; decisionesPendientes: number };
	isLoading: boolean;
	error: boolean;
	reload: () => Promise<IRiesgoConDecision[]>;
}

const ID_SEPARATOR = ',';

function useRiesgosIniciativa(tareas: Tarea[], tareasListas: boolean): IRiesgosIniciativaState {
	const [items, setItems] = useState<IRiesgoConDecision[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<boolean>(false);
	const [loadedKey, setLoadedKey] = useState<string | undefined>(undefined);
	const noCanceladas = tareas.filter((tarea) => tarea.Estado !== EstadoTarea.Cancelada);
	const idsKey = noCanceladas.map((tarea) => tarea.Id).join(ID_SEPARATOR);

	const reload = async (): Promise<IRiesgoConDecision[]> => {
		if (noCanceladas.length === 0) {
			setItems([]);
			setError(false);
			setIsLoading(false);
			setLoadedKey(idsKey);
			return [];
		}
		setIsLoading(true);
		setError(false);
		try {
			const loaded = await getRiesgoService().getActivosEscaladosByTareas(noCanceladas);
			setItems(loaded);
			setIsLoading(false);
			setLoadedKey(idsKey);
			return loaded;
		}
		catch (loadError) {
			console.error('No se pudieron cargar los riesgos de la iniciativa.', loadError);
			setError(true);
			setIsLoading(false);
			setLoadedKey(idsKey);
			return [];
		}
	};

	useEffect(() => {
		if (tareasListas) {
			reload();
		}
	}, [tareasListas, idsKey]);

	const indicadores = getIndicadoresRiesgos(items.map((item) => item.riesgo));

	return { items, indicadores, isLoading: isLoading || !tareasListas || loadedKey !== idsKey, error, reload };
}

export default useRiesgosIniciativa;

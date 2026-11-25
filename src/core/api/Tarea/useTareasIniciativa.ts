import { useEffect, useState } from 'react';

import { Tarea } from '../../entities';
import TareaDataSource from './TareaDataSource';

export interface ITareasIniciativaState {
	items: Tarea[];
	isLoading: boolean;
	error: boolean;
	reload: (id?: number) => Promise<Tarea[]>;
}

function useTareasIniciativa(iniciativaId: number | undefined): ITareasIniciativaState {
	const [items, setItems] = useState<Tarea[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<boolean>(false);

	const reload = async (id?: number): Promise<Tarea[]> => {
		const target = id ?? iniciativaId;
		if (target === undefined) {
			return [];
		}
		setIsLoading(true);
		setError(false);
		try {
			const loaded = await new TareaDataSource().getFilteredItems(target);
			setItems(loaded);
			setIsLoading(false);
			return loaded;
		}
		catch (loadError) {
			console.error('No se pudieron cargar las tareas de la iniciativa.', loadError);
			setError(true);
			setIsLoading(false);
			return [];
		}
	};

	useEffect(() => {
		reload();
	}, [iniciativaId]);

	return { items, isLoading, error, reload };
}

export default useTareasIniciativa;

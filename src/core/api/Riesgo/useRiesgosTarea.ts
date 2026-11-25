import { useEffect, useState } from 'react';

import { IRiesgoConDecision } from './IRiesgoService';
import { getRiesgoService } from './RiesgoService';

export interface IRiesgosTareaState {
	items: IRiesgoConDecision[];
	isLoading: boolean;
	error: boolean;
	reload: () => Promise<IRiesgoConDecision[]>;
}

function useRiesgosTarea(tareaId: number | undefined): IRiesgosTareaState {
	const [items, setItems] = useState<IRiesgoConDecision[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(tareaId !== undefined);
	const [error, setError] = useState<boolean>(false);

	const reload = async (): Promise<IRiesgoConDecision[]> => {
		if (tareaId === undefined) {
			return [];
		}
		setIsLoading(true);
		setError(false);
		try {
			const loaded = await getRiesgoService().getByTarea(tareaId);
			setItems(loaded);
			setIsLoading(false);
			return loaded;
		}
		catch (loadError) {
			console.error('No se pudieron cargar los riesgos de la tarea.', loadError);
			setError(true);
			setIsLoading(false);
			return [];
		}
	};

	useEffect(() => {
		reload();
	}, [tareaId]);

	return { items, isLoading, error, reload };
}

export default useRiesgosTarea;

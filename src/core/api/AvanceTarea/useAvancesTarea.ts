import { useEffect, useState } from 'react';

import { AvanceTarea } from '../../entities';
import AvanceTareaDataSource from './AvanceTareaDataSource';

export interface IAvancesTareaState {
	items: AvanceTarea[];
	isLoading: boolean;
	error: boolean;
	reload: () => Promise<void>;
}

const byNewest = (a: AvanceTarea, b: AvanceTarea): number =>
	(b.Created?.getTime() ?? 0) - (a.Created?.getTime() ?? 0) || (b.Id ?? 0) - (a.Id ?? 0);

function useAvancesTarea(tareaId: number | undefined): IAvancesTareaState {
	const [items, setItems] = useState<AvanceTarea[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<boolean>(false);

	const reload = async (): Promise<void> => {
		if (tareaId === undefined) {
			return;
		}
		setIsLoading(true);
		setError(false);
		try {
			const loaded = await new AvanceTareaDataSource().getFilteredItems(tareaId);
			setItems(loaded.slice().sort(byNewest));
		}
		catch (loadError) {
			console.error('No se pudo cargar el historial de avance de la tarea.', loadError);
			setError(true);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		reload();
	}, [tareaId]);

	return { items, isLoading, error, reload };
}

export default useAvancesTarea;

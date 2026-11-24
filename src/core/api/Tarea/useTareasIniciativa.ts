import { useEffect, useState } from 'react';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { stringIsNullOrEmpty } from '@pnp/common';

import { Tarea } from '../../entities';
import ITareaDataSource from './ITareaDataSource';
import TareaDataSource from './TareaDataSource';
import TareaMock from './TareaMock';

export interface ITareasIniciativaState {
	items: Tarea[];
	isLoading: boolean;
	error: boolean;
	reload: (id?: number) => Promise<Tarea[]>;
}

const getDatasource = (): ITareaDataSource => {
	const datasource = new TareaDataSource();
	return Environment.type === EnvironmentType.SharePoint && !stringIsNullOrEmpty(datasource.listTitle)
		? datasource
		: new TareaMock();
};

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
			const loaded = await getDatasource().getFilteredItems(target);
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

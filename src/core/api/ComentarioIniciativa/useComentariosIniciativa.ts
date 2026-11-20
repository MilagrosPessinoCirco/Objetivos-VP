import { useEffect, useState } from 'react';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { stringIsNullOrEmpty } from '@pnp/common';

import { ComentarioIniciativa } from '../../entities';
import ComentarioIniciativaDataSource from './ComentarioIniciativaDataSource';
import ComentarioIniciativaMock from './ComentarioIniciativaMock';
import IComentarioIniciativaDataSource from './IComentarioIniciativaDataSource';

export interface IComentariosIniciativaState {
	items: ComentarioIniciativa[];
	isLoading: boolean;
	error: boolean;
	reload: () => Promise<void>;
}

const getDatasource = (): IComentarioIniciativaDataSource => {
	const datasource = new ComentarioIniciativaDataSource();
	return Environment.type === EnvironmentType.SharePoint && !stringIsNullOrEmpty(datasource.listTitle)
		? datasource
		: new ComentarioIniciativaMock();
};

function useComentariosIniciativa(iniciativaId: number | undefined): IComentariosIniciativaState {
	const [items, setItems] = useState<ComentarioIniciativa[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<boolean>(false);

	const reload = async (): Promise<void> => {
		if (iniciativaId === undefined) {
			return;
		}
		setIsLoading(true);
		setError(false);
		try {
			setItems(await getDatasource().getFilteredItems(iniciativaId));
		}
		catch (loadError) {
			console.error('No se pudieron cargar los comentarios de la iniciativa.', loadError);
			setError(true);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		reload();
	}, [iniciativaId]);

	return { items, isLoading, error, reload };
}

export default useComentariosIniciativa;

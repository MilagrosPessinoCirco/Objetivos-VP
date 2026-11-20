import { useEffect, useState } from 'react';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { stringIsNullOrEmpty } from '@pnp/common';

import { ComentarioResultadoClave } from '../../entities';
import ComentarioResultadoClaveDataSource from './ComentarioResultadoClaveDataSource';
import ComentarioResultadoClaveMock from './ComentarioResultadoClaveMock';
import IComentarioResultadoClaveDataSource from './IComentarioResultadoClaveDataSource';

export interface IComentariosResultadoClaveState {
	items: ComentarioResultadoClave[];
	isLoading: boolean;
	error: boolean;
	reload: () => Promise<void>;
}

const getDatasource = (): IComentarioResultadoClaveDataSource => {
	const datasource = new ComentarioResultadoClaveDataSource();
	return Environment.type === EnvironmentType.SharePoint && !stringIsNullOrEmpty(datasource.listTitle)
		? datasource
		: new ComentarioResultadoClaveMock();
};

function useComentariosResultadoClave(resultadoClaveId: number | undefined): IComentariosResultadoClaveState {
	const [items, setItems] = useState<ComentarioResultadoClave[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<boolean>(false);

	const reload = async (): Promise<void> => {
		if (resultadoClaveId === undefined) {
			return;
		}
		setIsLoading(true);
		setError(false);
		try {
			setItems(await getDatasource().getFilteredItems(resultadoClaveId));
		}
		catch (loadError) {
			console.error('No se pudieron cargar los comentarios del resultado clave.', loadError);
			setError(true);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		reload();
	}, [resultadoClaveId]);

	return { items, isLoading, error, reload };
}

export default useComentariosResultadoClave;

import { useCallback, useEffect, useState } from 'react';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { stringIsNullOrEmpty } from '@pnp/common';

import { Rol } from '../../utils/Constants';
import { getRolFromGroups } from '../../utils/Permisos';
import IUsuarioDataSource from './IUsuarioDataSource';
import UsuarioDataSource from './UsuarioDataSource';
import UsuarioMock from './UsuarioMock';

export interface ICurrentRolState {
	rol?: Rol;
	isLoading: boolean;
	error: boolean;
	reload: () => Promise<Rol | undefined>;
}

const getDatasource = (): IUsuarioDataSource => {
	const datasource = new UsuarioDataSource();
	return Environment.type === EnvironmentType.SharePoint && !stringIsNullOrEmpty(datasource.listTitle)
		? datasource
		: new UsuarioMock();
};

const readRol = async (): Promise<Rol | undefined> => getRolFromGroups(await getDatasource().getCurrentUserGroups());

function useCurrentRol(): ICurrentRolState {
	const [state, setState] = useState<{ rol?: Rol; isLoading: boolean; error: boolean }>({ isLoading: true, error: false });

	useEffect(() => {
		readRol()
			.then((rol) => setState({ rol, isLoading: false, error: false }))
			.catch((error: unknown) => {
				console.error('No se pudieron obtener los grupos del usuario actual.', error);
				setState({ isLoading: false, error: true });
			});
	}, []);

	const reload = useCallback(async (): Promise<Rol | undefined> => {
		try {
			return await readRol();
		}
		catch (error) {
			console.error('No se pudieron volver a obtener los grupos del usuario actual.', error);
			throw error;
		}
	}, []);

	return { ...state, reload };
}

export default useCurrentRol;

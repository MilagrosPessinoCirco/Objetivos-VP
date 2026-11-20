import { useEffect, useState } from 'react';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { stringIsNullOrEmpty } from '@pnp/common';

import { IPersonValue } from '../../utils/Mappers';
import IUsuarioDataSource from './IUsuarioDataSource';
import UsuarioDataSource from './UsuarioDataSource';
import UsuarioMock from './UsuarioMock';

export interface ICurrentUserState {
	user?: IPersonValue;
	error: boolean;
}

const getDatasource = (): IUsuarioDataSource => {
	const datasource = new UsuarioDataSource();
	return Environment.type === EnvironmentType.SharePoint && !stringIsNullOrEmpty(datasource.listTitle)
		? datasource
		: new UsuarioMock();
};

function useCurrentUser(): ICurrentUserState {
	const [state, setState] = useState<ICurrentUserState>({ error: false });

	useEffect(() => {
		getDatasource().getCurrentUser()
			.then((user) => setState({ user, error: false }))
			.catch((error: unknown) => {
				console.error('No se pudo obtener el usuario actual.', error);
				setState({ error: true });
			});
	}, []);

	return state;
}

export default useCurrentUser;

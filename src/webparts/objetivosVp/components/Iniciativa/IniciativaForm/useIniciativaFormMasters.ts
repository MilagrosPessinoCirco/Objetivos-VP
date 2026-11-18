import * as React from 'react';

import useAreaDataSource from '../../../../../core/api/Area/useAreaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import useUsuarioDataSource from '../../../../../core/api/Usuario/useUsuarioDataSource';
import useCurrentUser from '../../../../../core/api/Usuario/useCurrentUser';
import { Area, Objetivo, Usuario } from '../../../../../core/entities';
import { IPersonValue } from '../../../../../core/utils/Mappers';

export interface IIniciativaFormMasters {
	objetivos: Objetivo[];
	areas: Area[];
	usuarios: Usuario[];
	currentUser?: IPersonValue;
	ready: boolean;
	error: boolean;
}

const useIniciativaFormMasters = (): IIniciativaFormMasters => {
	const [objetivoState, getObjetivos] = useObjetivoDataSource();
	const [areaState, getAreas] = useAreaDataSource();
	const [usuarioState, getUsuarios] = useUsuarioDataSource();
	const currentUser = useCurrentUser();
	const [ready, setReady] = React.useState<boolean>(false);

	React.useEffect(() => {
		Promise.all([getObjetivos(), getAreas(), getUsuarios()]).then(() => setReady(true));
	}, []);

	return {
		objetivos: objetivoState.items,
		areas: areaState.items,
		usuarios: usuarioState.items,
		currentUser: currentUser.user,
		ready: ready && (currentUser.user !== undefined || currentUser.error),
		error: Boolean(objetivoState.error || areaState.error || usuarioState.error)
	};
};

export default useIniciativaFormMasters;

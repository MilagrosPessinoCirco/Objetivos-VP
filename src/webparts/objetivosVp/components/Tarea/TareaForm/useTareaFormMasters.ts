import * as React from 'react';

import useAreaDataSource from '../../../../../core/api/Area/useAreaDataSource';
import useIniciativaDataSource from '../../../../../core/api/Iniciativa/useIniciativaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import useUsuarioDataSource from '../../../../../core/api/Usuario/useUsuarioDataSource';
import useCurrentUser from '../../../../../core/api/Usuario/useCurrentUser';
import { Area, Iniciativa, Objetivo, Usuario } from '../../../../../core/entities';
import { IPersonValue } from '../../../../../core/utils/Mappers';
import useObjetivoNames from '../../Objetivo/useObjetivoNames';

export interface ITareaFormMasters {
	iniciativas: Iniciativa[];
	objetivos: Objetivo[];
	areas: Area[];
	usuarios: Usuario[];
	currentUser?: IPersonValue;
	ready: boolean;
	error: boolean;
}

const useTareaFormMasters = (): ITareaFormMasters => {
	const [iniciativaState, getIniciativas] = useIniciativaDataSource();
	const [objetivoState, getObjetivos] = useObjetivoDataSource();
	const [areaState, getAreas] = useAreaDataSource();
	const [usuarioState, getUsuarios] = useUsuarioDataSource();
	const names = useObjetivoNames();
	const currentUser = useCurrentUser();
	const [ready, setReady] = React.useState<boolean>(false);

	React.useEffect(() => {
		Promise.all([getIniciativas(), getObjetivos(), getAreas(), getUsuarios()]).then(() => setReady(true));
	}, []);

	return {
		iniciativas: iniciativaState.items,
		objetivos: names.resolve(objetivoState.items),
		areas: areaState.items,
		usuarios: usuarioState.items,
		currentUser: currentUser.user,
		ready: ready && names.ready && (currentUser.user !== undefined || currentUser.error),
		error: Boolean(iniciativaState.error || objetivoState.error || areaState.error || usuarioState.error || names.error)
	};
};

export default useTareaFormMasters;

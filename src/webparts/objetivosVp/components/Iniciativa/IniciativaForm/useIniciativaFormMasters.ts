import * as React from 'react';

import useAreaDataSource from '../../../../../core/api/Area/useAreaDataSource';
import useObjetivoDataSource from '../../../../../core/api/Objetivo/useObjetivoDataSource';
import useResultadoClaveDataSource from '../../../../../core/api/ResultadoClave/useResultadoClaveDataSource';
import useUsuarioDataSource from '../../../../../core/api/Usuario/useUsuarioDataSource';
import useCurrentUser from '../../../../../core/api/Usuario/useCurrentUser';
import { Area, Objetivo, ResultadoClave, Usuario } from '../../../../../core/entities';
import { IPersonValue } from '../../../../../core/utils/Mappers';
import useObjetivoNames from '../../Objetivo/useObjetivoNames';

export interface IIniciativaFormMasters {
	objetivos: Objetivo[];
	areas: Area[];
	usuarios: Usuario[];
	resultadosClave: ResultadoClave[];
	currentUser?: IPersonValue;
	ready: boolean;
	error: boolean;
}

const useIniciativaFormMasters = (iniciativaId?: number): IIniciativaFormMasters => {
	const [objetivoState, getObjetivos] = useObjetivoDataSource();
	const [areaState, getAreas] = useAreaDataSource();
	const [usuarioState, getUsuarios] = useUsuarioDataSource();
	const [resultadoState, getResultados] = useResultadoClaveDataSource();
	const names = useObjetivoNames();
	const currentUser = useCurrentUser();
	const [ready, setReady] = React.useState<boolean>(false);

	React.useEffect(() => {
		Promise.all([
			getObjetivos(),
			getAreas(),
			getUsuarios(),
			iniciativaId === undefined ? Promise.resolve() : getResultados()
		]).then(() => setReady(true));
	}, []);

	return {
		objetivos: names.resolve(objetivoState.items),
		areas: areaState.items,
		usuarios: usuarioState.items,
		resultadosClave: iniciativaId === undefined ? [] : resultadoState.items.filter((item) => item.Iniciativa?.Id === iniciativaId),
		currentUser: currentUser.user,
		ready: ready && names.ready && (currentUser.user !== undefined || currentUser.error),
		error: Boolean(objetivoState.error || areaState.error || usuarioState.error || resultadoState.error || names.error)
	};
};

export default useIniciativaFormMasters;

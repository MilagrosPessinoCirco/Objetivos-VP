import * as React from 'react';

import useDepartamentoDataSource from '../../../../core/api/Departamento/useDepartamentoDataSource';
import useGerenciaDataSource from '../../../../core/api/Gerencia/useGerenciaDataSource';
import useVicepresidenciaDataSource from '../../../../core/api/Vicepresidencia/useVicepresidenciaDataSource';
import { Objetivo } from '../../../../core/entities';
import { ILookupValue } from '../../../../core/utils/Mappers';

interface INamed {
	Id?: number;
	Nombre?: string;
}

export interface IObjetivoNames {
	ready: boolean;
	error: boolean;
	resolve: (objetivos: Objetivo[]) => Objetivo[];
}

const withName = (lookup: ILookupValue | undefined, masters: INamed[]): ILookupValue | undefined => {
	if (!lookup) {
		return undefined;
	}
	const master = masters.filter((item) => item.Id === lookup.Id)[0];
	return { Id: lookup.Id, Title: master?.Nombre ?? lookup.Title };
};

const useObjetivoNames = (): IObjetivoNames => {
	const [vpState, getVps] = useVicepresidenciaDataSource();
	const [departamentoState, getDepartamentos] = useDepartamentoDataSource();
	const [gerenciaState, getGerencias] = useGerenciaDataSource();
	const [ready, setReady] = React.useState<boolean>(false);

	React.useEffect(() => {
		Promise.all([getVps(), getDepartamentos(), getGerencias()]).then(() => setReady(true));
	}, []);

	const resolve = (objetivos: Objetivo[]): Objetivo[] =>
		objetivos.map((objetivo) => Object.assign(new Objetivo(), objetivo, {
			VP: withName(objetivo.VP, vpState.items),
			Departamento: withName(objetivo.Departamento, departamentoState.items),
			Gerencia: withName(objetivo.Gerencia, gerenciaState.items)
		}));

	return { ready, error: vpState.error || departamentoState.error || gerenciaState.error, resolve };
};

export default useObjetivoNames;

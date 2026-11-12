import * as React from 'react';

import useDepartamentoDataSource from '../../../../../core/api/Departamento/useDepartamentoDataSource';
import useGerenciaDataSource from '../../../../../core/api/Gerencia/useGerenciaDataSource';
import usePalancaDataSource from '../../../../../core/api/Palanca/usePalancaDataSource';
import useVicepresidenciaDataSource from '../../../../../core/api/Vicepresidencia/useVicepresidenciaDataSource';
import { Departamento, Gerencia, Palanca, Vicepresidencia } from '../../../../../core/entities';

export interface IObjetivoFormMasters {
	vps: Vicepresidencia[];
	departamentos: Departamento[];
	gerencias: Gerencia[];
	palancas: Palanca[];
	ready: boolean;
	error: boolean;
}

const useObjetivoFormMasters = (): IObjetivoFormMasters => {
	const [vpState, getVps] = useVicepresidenciaDataSource();
	const [departamentoState, getDepartamentos] = useDepartamentoDataSource();
	const [gerenciaState, getGerencias] = useGerenciaDataSource();
	const [palancaState, getPalancas] = usePalancaDataSource();
	const [ready, setReady] = React.useState<boolean>(false);

	React.useEffect(() => {
		Promise.all([getVps(), getDepartamentos(), getGerencias(), getPalancas()]).then(() => setReady(true));
	}, []);

	return {
		vps: vpState.items,
		departamentos: departamentoState.items,
		gerencias: gerenciaState.items,
		palancas: palancaState.items,
		ready,
		error: Boolean(vpState.error || departamentoState.error || gerenciaState.error || palancaState.error)
	};
};

export default useObjetivoFormMasters;

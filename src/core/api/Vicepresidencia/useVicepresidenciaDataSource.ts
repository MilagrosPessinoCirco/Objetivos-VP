import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Vicepresidencia } from '../../entities';
import VicepresidenciaDataSource from './VicepresidenciaDataSource';

function useVicepresidenciaDataSource(): DatasourceHook<Vicepresidencia> {
	return useDatasource<Vicepresidencia>(new VicepresidenciaDataSource());
}

export default useVicepresidenciaDataSource;

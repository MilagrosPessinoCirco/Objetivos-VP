import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Vicepresidencia } from '../../entities';
import VicepresidenciaDataSource from './VicepresidenciaDataSource';
import VicepresidenciaMock from './VicepresidenciaMock';

function useVicepresidenciaDataSource(): DatasourceHook<Vicepresidencia> {
	return useDatasource<Vicepresidencia>(new VicepresidenciaDataSource(), new VicepresidenciaMock());
}

export default useVicepresidenciaDataSource;

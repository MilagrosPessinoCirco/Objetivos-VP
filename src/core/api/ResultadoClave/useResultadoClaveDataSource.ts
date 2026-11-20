import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { ResultadoClave } from '../../entities';
import ResultadoClaveDataSource from './ResultadoClaveDataSource';
import ResultadoClaveMock from './ResultadoClaveMock';

function useResultadoClaveDataSource(): DatasourceHook<ResultadoClave> {
	return useDatasource<ResultadoClave>(new ResultadoClaveDataSource(), new ResultadoClaveMock());
}

export default useResultadoClaveDataSource;

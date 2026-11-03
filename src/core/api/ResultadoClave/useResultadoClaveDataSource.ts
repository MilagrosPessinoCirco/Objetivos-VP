import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { ResultadoClave } from '../../entities';
import ResultadoClaveDataSource from './ResultadoClaveDataSource';

function useResultadoClaveDataSource(): DatasourceHook<ResultadoClave> {
	return useDatasource<ResultadoClave>(new ResultadoClaveDataSource());
}

export default useResultadoClaveDataSource;

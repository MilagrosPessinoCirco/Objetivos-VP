import { useDatasource } from '../../api';
import { ResultadoClave } from '../../entities';
import ResultadoClaveDataSource from './ResultadoClaveDataSource';
import ResultadoClaveMock from './ResultadoClaveMock';

function useItemResultadoClaveDataSource() {
	return useDatasource<ResultadoClave>(new ResultadoClaveDataSource(), new ResultadoClaveMock());
}

export default useItemResultadoClaveDataSource;

import { useDatasource } from '../../api';
import { ResultadoClave } from '../../entities';
import ResultadoClaveDataSource from './ResultadoClaveDataSource';

function useItemResultadoClaveDataSource() {
	return useDatasource<ResultadoClave>(new ResultadoClaveDataSource());
}

export default useItemResultadoClaveDataSource;

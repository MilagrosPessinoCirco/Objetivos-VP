import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { ComentarioResultadoClave } from '../../entities';
import ComentarioResultadoClaveDataSource from './ComentarioResultadoClaveDataSource';

function useComentarioResultadoClaveDataSource(): DatasourceHook<ComentarioResultadoClave> {
	return useDatasource<ComentarioResultadoClave>(new ComentarioResultadoClaveDataSource());
}

export default useComentarioResultadoClaveDataSource;

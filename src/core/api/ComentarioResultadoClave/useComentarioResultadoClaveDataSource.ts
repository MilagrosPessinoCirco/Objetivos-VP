import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { ComentarioResultadoClave } from '../../entities';
import ComentarioResultadoClaveDataSource from './ComentarioResultadoClaveDataSource';
import ComentarioResultadoClaveMock from './ComentarioResultadoClaveMock';

function useComentarioResultadoClaveDataSource(): DatasourceHook<ComentarioResultadoClave> {
	return useDatasource<ComentarioResultadoClave>(new ComentarioResultadoClaveDataSource(), new ComentarioResultadoClaveMock());
}

export default useComentarioResultadoClaveDataSource;

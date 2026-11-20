import { useDatasource } from '../../api';
import { ComentarioResultadoClave } from '../../entities';
import ComentarioResultadoClaveDataSource from './ComentarioResultadoClaveDataSource';
import ComentarioResultadoClaveMock from './ComentarioResultadoClaveMock';

function useItemComentarioResultadoClaveDataSource() {
	return useDatasource<ComentarioResultadoClave>(new ComentarioResultadoClaveDataSource(), new ComentarioResultadoClaveMock());
}

export default useItemComentarioResultadoClaveDataSource;

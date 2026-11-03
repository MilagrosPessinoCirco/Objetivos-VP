import { useDatasource } from '../../api';
import { ComentarioResultadoClave } from '../../entities';
import ComentarioResultadoClaveDataSource from './ComentarioResultadoClaveDataSource';

function useItemComentarioResultadoClaveDataSource() {
	return useDatasource<ComentarioResultadoClave>(new ComentarioResultadoClaveDataSource());
}

export default useItemComentarioResultadoClaveDataSource;

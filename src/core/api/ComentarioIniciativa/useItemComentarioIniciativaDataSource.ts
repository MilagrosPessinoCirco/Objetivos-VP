import { useDatasource } from '../../api';
import { ComentarioIniciativa } from '../../entities';
import ComentarioIniciativaDataSource from './ComentarioIniciativaDataSource';

function useItemComentarioIniciativaDataSource() {
	return useDatasource<ComentarioIniciativa>(new ComentarioIniciativaDataSource());
}

export default useItemComentarioIniciativaDataSource;

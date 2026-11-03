import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { ComentarioIniciativa } from '../../entities';
import ComentarioIniciativaDataSource from './ComentarioIniciativaDataSource';

function useComentarioIniciativaDataSource(): DatasourceHook<ComentarioIniciativa> {
	return useDatasource<ComentarioIniciativa>(new ComentarioIniciativaDataSource());
}

export default useComentarioIniciativaDataSource;

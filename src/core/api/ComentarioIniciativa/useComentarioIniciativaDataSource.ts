import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { ComentarioIniciativa } from '../../entities';
import ComentarioIniciativaDataSource from './ComentarioIniciativaDataSource';
import ComentarioIniciativaMock from './ComentarioIniciativaMock';

function useComentarioIniciativaDataSource(): DatasourceHook<ComentarioIniciativa> {
	return useDatasource<ComentarioIniciativa>(new ComentarioIniciativaDataSource(), new ComentarioIniciativaMock());
}

export default useComentarioIniciativaDataSource;

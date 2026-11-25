import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Tarea } from '../../entities';
import TareaDataSource from './TareaDataSource';
import TareaMock from './TareaMock';

function useTareaDataSource(): DatasourceHook<Tarea> {
	return useDatasource<Tarea>(new TareaDataSource(), new TareaMock());
}

export default useTareaDataSource;

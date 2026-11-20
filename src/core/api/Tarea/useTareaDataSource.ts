import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Tarea } from '../../entities';
import TareaDataSource from './TareaDataSource';

function useTareaDataSource(): DatasourceHook<Tarea> {
	return useDatasource<Tarea>(new TareaDataSource());
}

export default useTareaDataSource;

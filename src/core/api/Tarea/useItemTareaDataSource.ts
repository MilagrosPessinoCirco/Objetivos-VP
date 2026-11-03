import { useDatasource } from '../../api';
import { Tarea } from '../../entities';
import TareaDataSource from './TareaDataSource';

function useItemTareaDataSource() {
	return useDatasource<Tarea>(new TareaDataSource());
}

export default useItemTareaDataSource;

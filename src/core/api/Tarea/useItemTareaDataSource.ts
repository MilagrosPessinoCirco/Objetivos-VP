import { useDatasource } from '../../api';
import { Tarea } from '../../entities';
import TareaDataSource from './TareaDataSource';
import TareaMock from './TareaMock';

function useItemTareaDataSource() {
	return useDatasource<Tarea>(new TareaDataSource(), new TareaMock());
}

export default useItemTareaDataSource;

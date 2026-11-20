import { useDatasource } from '../../api';
import { Iniciativa } from '../../entities';
import IniciativaDataSource from './IniciativaDataSource';

function useItemIniciativaDataSource() {
	return useDatasource<Iniciativa>(new IniciativaDataSource());
}

export default useItemIniciativaDataSource;

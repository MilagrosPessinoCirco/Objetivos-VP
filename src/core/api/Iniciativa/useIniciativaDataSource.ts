import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Iniciativa } from '../../entities';
import IniciativaDataSource from './IniciativaDataSource';

function useIniciativaDataSource(): DatasourceHook<Iniciativa> {
	return useDatasource<Iniciativa>(new IniciativaDataSource());
}

export default useIniciativaDataSource;

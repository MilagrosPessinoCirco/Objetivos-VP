import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Iniciativa } from '../../entities';
import IniciativaDataSource from './IniciativaDataSource';
import IniciativaMock from './IniciativaMock';

function useIniciativaDataSource(): DatasourceHook<Iniciativa> {
	return useDatasource<Iniciativa>(new IniciativaDataSource(), new IniciativaMock());
}

export default useIniciativaDataSource;

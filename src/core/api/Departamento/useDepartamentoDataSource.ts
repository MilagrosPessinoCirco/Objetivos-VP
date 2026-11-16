import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Departamento } from '../../entities';
import DepartamentoDataSource from './DepartamentoDataSource';
import DepartamentoMock from './DepartamentoMock';

function useDepartamentoDataSource(): DatasourceHook<Departamento> {
	return useDatasource<Departamento>(new DepartamentoDataSource(), new DepartamentoMock());
}

export default useDepartamentoDataSource;

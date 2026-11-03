import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Departamento } from '../../entities';
import DepartamentoDataSource from './DepartamentoDataSource';

function useDepartamentoDataSource(): DatasourceHook<Departamento> {
	return useDatasource<Departamento>(new DepartamentoDataSource());
}

export default useDepartamentoDataSource;

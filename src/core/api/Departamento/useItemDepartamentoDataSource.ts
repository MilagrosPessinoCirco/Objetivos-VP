import { useDatasource } from '../../api';
import { Departamento } from '../../entities';
import DepartamentoDataSource from './DepartamentoDataSource';

function useItemDepartamentoDataSource() {
	return useDatasource<Departamento>(new DepartamentoDataSource());
}

export default useItemDepartamentoDataSource;

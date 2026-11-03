import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Gerencia } from '../../entities';
import GerenciaDataSource from './GerenciaDataSource';

function useGerenciaDataSource(): DatasourceHook<Gerencia> {
	return useDatasource<Gerencia>(new GerenciaDataSource());
}

export default useGerenciaDataSource;

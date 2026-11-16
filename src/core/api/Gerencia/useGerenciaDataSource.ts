import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Gerencia } from '../../entities';
import GerenciaDataSource from './GerenciaDataSource';
import GerenciaMock from './GerenciaMock';

function useGerenciaDataSource(): DatasourceHook<Gerencia> {
	return useDatasource<Gerencia>(new GerenciaDataSource(), new GerenciaMock());
}

export default useGerenciaDataSource;

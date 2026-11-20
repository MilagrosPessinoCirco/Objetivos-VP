import { useDatasource } from '../../api';
import { Gerencia } from '../../entities';
import GerenciaDataSource from './GerenciaDataSource';

function useItemGerenciaDataSource() {
	return useDatasource<Gerencia>(new GerenciaDataSource());
}

export default useItemGerenciaDataSource;

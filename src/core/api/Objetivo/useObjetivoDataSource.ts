import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Objetivo } from '../../entities';
import ObjetivoDataSource from './ObjetivoDataSource';

function useObjetivoDataSource(): DatasourceHook<Objetivo> {
	return useDatasource<Objetivo>(new ObjetivoDataSource());
}

export default useObjetivoDataSource;

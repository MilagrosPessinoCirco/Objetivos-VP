import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Objetivo } from '../../entities';
import ObjetivoDataSource from './ObjetivoDataSource';
import ObjetivoMock from './ObjetivoMock';

function useObjetivoDataSource(): DatasourceHook<Objetivo> {
	return useDatasource<Objetivo>(new ObjetivoDataSource(), new ObjetivoMock());
}

export default useObjetivoDataSource;

import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Riesgo } from '../../entities';
import RiesgoDataSource from './RiesgoDataSource';

function useRiesgoDataSource(): DatasourceHook<Riesgo> {
	return useDatasource<Riesgo>(new RiesgoDataSource());
}

export default useRiesgoDataSource;

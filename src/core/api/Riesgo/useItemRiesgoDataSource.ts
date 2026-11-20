import { useDatasource } from '../../api';
import { Riesgo } from '../../entities';
import RiesgoDataSource from './RiesgoDataSource';

function useItemRiesgoDataSource() {
	return useDatasource<Riesgo>(new RiesgoDataSource());
}

export default useItemRiesgoDataSource;

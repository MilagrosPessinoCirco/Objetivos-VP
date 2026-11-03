import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Palanca } from '../../entities';
import PalancaDataSource from './PalancaDataSource';

function usePalancaDataSource(): DatasourceHook<Palanca> {
	return useDatasource<Palanca>(new PalancaDataSource());
}

export default usePalancaDataSource;

import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Palanca } from '../../entities';
import PalancaDataSource from './PalancaDataSource';
import PalancaMock from './PalancaMock';

function usePalancaDataSource(): DatasourceHook<Palanca> {
	return useDatasource<Palanca>(new PalancaDataSource(), new PalancaMock());
}

export default usePalancaDataSource;

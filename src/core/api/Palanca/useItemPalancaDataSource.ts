import { useDatasource } from '../../api';
import { Palanca } from '../../entities';
import PalancaDataSource from './PalancaDataSource';

function useItemPalancaDataSource() {
	return useDatasource<Palanca>(new PalancaDataSource());
}

export default useItemPalancaDataSource;

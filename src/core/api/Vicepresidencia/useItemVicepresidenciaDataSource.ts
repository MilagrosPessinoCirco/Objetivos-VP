import { useDatasource } from '../../api';
import { Vicepresidencia } from '../../entities';
import VicepresidenciaDataSource from './VicepresidenciaDataSource';

function useItemVicepresidenciaDataSource() {
	return useDatasource<Vicepresidencia>(new VicepresidenciaDataSource());
}

export default useItemVicepresidenciaDataSource;

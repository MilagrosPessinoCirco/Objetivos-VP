import { useDatasource } from '../../api';
import { Area } from '../../entities';
import AreaDataSource from './AreaDataSource';

function useItemAreaDataSource() {
	return useDatasource<Area>(new AreaDataSource());
}

export default useItemAreaDataSource;

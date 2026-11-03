import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Area } from '../../entities';
import AreaDataSource from './AreaDataSource';

function useAreaDataSource(): DatasourceHook<Area> {
	return useDatasource<Area>(new AreaDataSource());
}

export default useAreaDataSource;

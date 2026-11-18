import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { Area } from '../../entities';
import AreaDataSource from './AreaDataSource';
import AreaMock from './AreaMock';

function useAreaDataSource(): DatasourceHook<Area> {
	return useDatasource<Area>(new AreaDataSource(), new AreaMock());
}

export default useAreaDataSource;

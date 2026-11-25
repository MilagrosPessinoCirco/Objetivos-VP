import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { AvanceTarea } from '../../entities';
import AvanceTareaDataSource from './AvanceTareaDataSource';
import AvanceTareaMock from './AvanceTareaMock';

function useAvanceTareaDataSource(): DatasourceHook<AvanceTarea> {
	return useDatasource<AvanceTarea>(new AvanceTareaDataSource(), new AvanceTareaMock());
}

export default useAvanceTareaDataSource;

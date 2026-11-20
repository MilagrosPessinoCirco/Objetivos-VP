import { useDatasource } from '../../api';
import { DatasourceHook } from '../../api/useDatasource';
import { AvanceTarea } from '../../entities';
import AvanceTareaDataSource from './AvanceTareaDataSource';

function useAvanceTareaDataSource(): DatasourceHook<AvanceTarea> {
	return useDatasource<AvanceTarea>(new AvanceTareaDataSource());
}

export default useAvanceTareaDataSource;

import { useDatasource } from '../../api';
import { AvanceTarea } from '../../entities';
import AvanceTareaDataSource from './AvanceTareaDataSource';
import AvanceTareaMock from './AvanceTareaMock';

function useItemAvanceTareaDataSource() {
	return useDatasource<AvanceTarea>(new AvanceTareaDataSource(), new AvanceTareaMock());
}

export default useItemAvanceTareaDataSource;
